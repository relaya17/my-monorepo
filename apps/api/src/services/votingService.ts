/**
 * Smart Voting: create, cast (with weight/proxy), close, protocol, auto-execution to maintenance.
 */
import crypto from 'crypto';
import { Types } from 'mongoose';
import Voting, { IVoting, IVoteEntry } from '../models/votingModel.js';
import Maintenance from '../models/maintenanceModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { logActivityServer } from '../utils/auditLog.js';

export interface CreateVoteInput {
  title: string;
  description?: string;
  relatedMaintenanceId?: string;
  options: { text: string; costEstimate?: number }[];
  deadline: Date;
  requiredQuorum?: number;
  eligibleVoterCount?: number;
}

export interface CastVoteInput {
  optionIndex: number;
  voteWeight?: number;
  proxyForUserId?: string;
}

/** Create vote (committee/admin). */
export async function createVote(buildingId: string, input: CreateVoteInput): Promise<IVoting> {
  return tenantContext.run({ buildingId }, async () => {
    const doc = await Voting.create({
      title: input.title,
      description: input.description,
      relatedMaintenanceId: input.relatedMaintenanceId ? new Types.ObjectId(input.relatedMaintenanceId) : undefined,
      options: input.options,
      deadline: new Date(input.deadline),
      requiredQuorum: input.requiredQuorum ?? 51,
      eligibleVoterCount: input.eligibleVoterCount,
      status: 'Open',
      votes: [],
    });
    return doc;
  });
}

/** Cast vote (one per user or per proxy slot). Weight default 1. */
export async function castVote(
  buildingId: string,
  voteId: string,
  userId: string,
  input: CastVoteInput
): Promise<IVoting> {
  return tenantContext.run({ buildingId }, async () => {
    const vote = await Voting.findOne({ _id: voteId, status: 'Open' });
    if (!vote) throw new Error('ההצבעה לא קיימת או נסגרה');
    if (new Date() > vote.deadline) throw new Error('תם מועד ההצבעה');
    if (input.optionIndex < 0 || input.optionIndex >= vote.options.length) throw new Error('אפשרות לא תקינה');

    const uid = new Types.ObjectId(userId);
    const proxyId = input.proxyForUserId ? new Types.ObjectId(input.proxyForUserId) : null;
    const existing = vote.votes.find(
      (v) => v.userId.equals(uid) && String(v.proxyForUserId ?? '') === String(proxyId ?? '')
    );
    if (existing) throw new Error('כבר הצבעת בהצבעה זו');

    const entry: IVoteEntry = {
      userId: uid,
      optionIndex: input.optionIndex,
      votedAt: new Date(),
      voteWeight: input.voteWeight ?? 1,
      proxyForUserId: proxyId ?? undefined,
    };
    vote.votes.push(entry);
    await vote.save();
    return vote;
  });
}

interface VoteLike {
  options: { text: string; costEstimate?: number }[];
  votes: { optionIndex: number; voteWeight?: number }[];
}

function computeResults(vote: VoteLike): { optionIndex: number; totalWeight: number; voteCount: number }[] {
  const byOption: Record<number, { totalWeight: number; voteCount: number }> = {};
  for (let i = 0; i < vote.options.length; i++) byOption[i] = { totalWeight: 0, voteCount: 0 };
  for (const v of vote.votes) {
    const w = v.voteWeight ?? 1;
    byOption[v.optionIndex].totalWeight += w;
    byOption[v.optionIndex].voteCount += 1;
  }
  return vote.options.map((_, i) => ({
    optionIndex: i,
    totalWeight: byOption[i].totalWeight,
    voteCount: byOption[i].voteCount,
  }));
}

function generateProtocolSignature(vote: IVoting, winningIndex: number): string {
  const payload = [
    vote.title,
    vote.deadline.toISOString(),
    vote.closedAt?.toISOString() ?? '',
    vote.status,
    vote.options.map((o) => `${o.text}:${o.costEstimate ?? ''}`).join('|'),
    vote.votes.length,
    winningIndex,
  ].join('\n');
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/** Close vote: set Passed/Rejected/Expired, generate protocol, optionally create work order. */
export async function closeVote(buildingId: string, voteId: string): Promise<IVoting> {
  return tenantContext.run({ buildingId }, async () => {
    const vote = await Voting.findOne({ _id: voteId });
    if (!vote) throw new Error('ההצבעה לא קיימת');
    if (vote.status !== 'Open') throw new Error('ההצבעה כבר נסגרה');

    const now = new Date();
    const expired = now > vote.deadline;
    const eligible = vote.eligibleVoterCount ?? vote.votes.length;
    const totalWeight = vote.votes.reduce((s, v) => s + (v.voteWeight ?? 1), 0);
    const participationPercent = eligible > 0 ? (vote.votes.length / eligible) * 100 : 0;
    const quorumMet = participationPercent >= vote.requiredQuorum;

    const results = computeResults(vote);
    const winning = results.length
      ? results.reduce((a, b) => (a.totalWeight >= b.totalWeight ? a : b), results[0])
      : { optionIndex: 0, totalWeight: 0, voteCount: 0 };
    const winningIndex = winning.optionIndex;

    if (expired) {
      vote.status = 'Expired';
    } else if (!quorumMet) {
      vote.status = 'Rejected';
    } else {
      vote.status = 'Passed';
    }
    vote.closedAt = now;
    vote.protocolSignature = generateProtocolSignature(vote, winningIndex);
    vote.executionStatus = vote.status === 'Passed' ? 'Pending' : undefined;
    vote.protocolSummary = `הצבעה: ${vote.title}. סטטוס: ${vote.status}. משתתפים: ${vote.votes.length}/${eligible}. אפשרות מנצחת: ${vote.options[winningIndex]?.text ?? winningIndex}.`;
    await vote.save();

    if (vote.status === 'Passed' && vote.relatedMaintenanceId) {
      await linkVoteToWorkOrder(buildingId, vote, winningIndex);
      vote.executionStatus = 'WorkOrderCreated';
      await vote.save();
    }

    await logActivityServer('VOTING_CLOSED', 'VOTING', {
      buildingId,
      voteId: vote._id.toString(),
      status: vote.status,
      protocolSignature: vote.protocolSignature,
    });
    return vote;
  });
}

/** When vote passes, update linked Maintenance (work order) with winning option cost. */
async function linkVoteToWorkOrder(buildingId: string, vote: IVoting, winningIndex: number): Promise<void> {
  const opt = vote.options[winningIndex];
  const costEstimate = opt?.costEstimate;
  await tenantContext.run({ buildingId }, async () => {
    const updated = await Maintenance.findOneAndUpdate(
      { _id: vote.relatedMaintenanceId },
      {
        $set: {
          status: 'Open',
          ...(costEstimate != null && {
            'assignedContractor.estimatedCost': costEstimate,
          }),
        },
      },
      { new: true }
    );
    if (updated) {
      await logActivityServer('VOTE_AUTO_EXECUTION', 'MAINTENANCE', {
        buildingId,
        maintenanceId: updated._id.toString(),
        voteId: vote._id.toString(),
        winningOption: opt?.text,
        costEstimate,
      });
    }
  });
}

/** Get results (counts, quorum, winning option). */
export async function getVoteResults(buildingId: string, voteId: string) {
  return tenantContext.run({ buildingId }, async () => {
    const raw = await Voting.findOne({ _id: voteId }).lean();
    if (!raw) return null;
    const vote = raw as {
      _id: Types.ObjectId;
      title: string;
      status: string;
      deadline: Date;
      closedAt?: Date;
      protocolSignature?: string;
      protocolSummary?: string;
      options: { text: string; costEstimate?: number }[];
      votes: { optionIndex: number; voteWeight?: number }[];
      eligibleVoterCount?: number;
      requiredQuorum?: number;
    };
    const results = computeResults(vote);
    const eligible = vote.eligibleVoterCount ?? vote.votes.length;
    const participationPercent = eligible > 0 ? (vote.votes.length / eligible) * 100 : 0;
    const requiredQuorum = vote.requiredQuorum ?? 51;
    const winning = results.length ? results.reduce((a, b) => (a.totalWeight >= b.totalWeight ? a : b), results[0]) : null;
    return {
      vote: {
        _id: vote._id,
        title: vote.title,
        status: vote.status,
        deadline: vote.deadline,
        closedAt: vote.closedAt,
        protocolSignature: vote.protocolSignature,
        protocolSummary: vote.protocolSummary,
      },
      options: vote.options.map((o, i) => ({
        text: o.text,
        costEstimate: o.costEstimate,
        optionIndex: i,
        totalWeight: results[i].totalWeight,
        voteCount: results[i].voteCount,
      })),
      totalVotes: vote.votes.length,
      eligibleVoterCount: eligible,
      participationPercent,
      quorumMet: participationPercent >= requiredQuorum,
      requiredQuorum,
      winningOptionIndex: winning?.optionIndex ?? null,
    };
  });
}
