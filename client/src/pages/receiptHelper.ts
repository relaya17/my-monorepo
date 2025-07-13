// client/src/receiptHelper.ts
export const generateReceipt = async (payer: string, amount: number) => {
  try {
    const response = await fetch('http://localhost:3008/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payer, amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate receipt');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};
