import { Suspense, lazy, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ROUTES from "../routs/routes";

// Route-level code splitting to reduce initial bundle size.
const Home = lazy(() => import("../pages/Home"));
const Landing = lazy(() => import("../pages/Landing").then((m) => ({ default: m.default ?? m.Landing })));
const LandingTechnician = lazy(() => import("../pages/LandingTechnician"));
const LandingResident = lazy(() => import("../pages/LandingResident"));
const Error404Page = lazy(() => import("../pages/404/Error404Page"));
const ThankYouPage = lazy(() => import("../pages/thankyou/Thankyou"));

const ResidentForm = lazy(() => import("../pages/ResidentForm"));
const NewResidentApproval = lazy(() => import("../pages/NewResidentApproval"));
const ResidentHome = lazy(() => import("../pages/ResidentHome"));

const Gardening = lazy(() => import("../pages/Gardening"));
const RepairTracking = lazy(() => import("../pages/RepairTracking"));

const EmployeeManagement = lazy(() => import("../pages/EmployeeManagement"));

const ForRent = lazy(() => import("../pages/ForRent"));
const ForSale = lazy(() => import("../pages/ForSale"));

const PrivacyPolicy = lazy(() => import("../pages/seqerty/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("../pages/seqerty/TermsAndConditions"));
const Accessibility = lazy(() => import("../pages/seqerty/Accessibility"));
const SecurityPolicy = lazy(() => import("../pages/seqerty/SecurityPolicy"));

const SignUpPage = lazy(() => import("../pages/users/UI/SignUpPage"));
const UsersListPage = lazy(() => import("../pages/users/UI/UsersListPage"));
const UserDetailsPage = lazy(() => import("../pages/users/UI/UserDetailsPage"));
const UserManagement = lazy(() => import("../pages/users/UI/UserManagement"));
const CreateAdminPassword = lazy(() => import("../pages/users/UI/CreateAdminPassword"));
const ChangeAdminPassword = lazy(() => import("../pages/users/UI/ChangeAdminPassword"));

const CheckOutPage = lazy(() => import("../pages/CheckOutPage"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));

const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));

const UserLogin = lazy(() => import("../pages/UserLogin"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const UserDashboard = lazy(() => import("../pages/UserDashboard"));

const ReceiptPage = lazy(() => import("../pages/ReceiptPage"));

const Voting = lazy(() => import("../components/Voting"));

const CommunityWall = lazy(() => import("../pages/CommunityWall"));

const AIDashboard = lazy(() => import("../pages/AIDashboard"));

const PaymentManagement = lazy(() => import("../pages/PaymentManagement"));

const ApartmentManagement = lazy(() => import("../pages/ApartmentManagement"));

const ReportsDashboard = lazy(() => import("../pages/ReportsDashboard"));

const MaintenanceManagement = lazy(() => import("../pages/MaintenanceManagement"));

const SystemSettings = lazy(() => import("../pages/SystemSettings"));
const BuildingSelect = lazy(() => import("../pages/BuildingSelect"));
const ContractsAndLetters = lazy(() => import("../pages/ContractsAndLetters"));
const SafeZonePage = lazy(() => import("../pages/SafeZonePage"));
const EnterpriseRegisterPage = lazy(() => import("../pages/EnterpriseRegisterPage"));
const SalesToolkitPage = lazy(() => import("../pages/SalesToolkitPage"));

// קומפוננטת עזר - עטיפת טופס דייר
const ResidentFormWrapper: React.FC = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [familyStatus, setFamilyStatus] = useState("");
  const [apartment, setApartment] = useState("");

  const handleSubmit = () => {
    // Form submitted successfully
  };

  return (
    <ResidentForm
      name={name}
      age={age}
      familyStatus={familyStatus}
      apartment={apartment}
      onSubmit={handleSubmit}
      setName={setName}
      setAge={setAge}
      setFamilyStatus={setFamilyStatus}
      setApartment={setApartment}
      isEdit={false}
    />
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<div className="container py-4 text-center">טוען...</div>}>
      <Routes>
        {/* דף הבית – מוצג אחרי רענון/רסטרט כשנכנסים לשורש */}
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.LANDING} element={<Landing />} />
        <Route path={ROUTES.LANDING_TECHNICIAN} element={<LandingTechnician />} />
        <Route path={ROUTES.LANDING_RESIDENT} element={<LandingResident />} />
        {/* אם נפתח עם /index.html (למשל בפרודקשן) – הפניה לדף הבית */}
        <Route path="/index.html" element={<Navigate to={ROUTES.HOME} replace />} />

        {/* דף הבית של הדיירים */}
        <Route path={ROUTES.RESIDENT_HOME} element={<ResidentHome />} />

        {/* דיירים */}
        <Route path={ROUTES.RESIDENT_FORM} element={<ResidentFormWrapper />} />
        <Route path={ROUTES.NEW_RESIDENT_APPROVAL} element={<NewResidentApproval />} />

        {/* תחזוקה */}
        <Route path={ROUTES.REPAIR_TRACKING} element={<RepairTracking />} />
        <Route path={ROUTES.GARDENING} element={<Gardening />} />

        {/* דירות */}
        <Route path={ROUTES.FOR_RENT} element={<ForRent />} />
        <Route path={ROUTES.FOR_SALE} element={<ForSale />} />

        {/* עובדים */}
        <Route path={ROUTES.EMPLOYEE_MANAGEMENT} element={<EmployeeManagement />} />

        {/* משתמשים */}
        <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
        <Route path={ROUTES.USERS_LIST} element={<UsersListPage />} />
        <Route path={ROUTES.USER_DETAILS} element={<UserDetailsPage />} />
        <Route path={ROUTES.USER_MANAGEMENT} element={<UserManagement />} />
        <Route path={ROUTES.CREATE_ADMIN_PASSWORD} element={<CreateAdminPassword />} />
        <Route path={ROUTES.CHANGE_ADMIN_PASSWORD} element={<ChangeAdminPassword />} />

        {/* תשלום */}
        <Route path={ROUTES.CHECK_OUT} element={<CheckOutPage />} />
        <Route path="/payment-page" element={<PaymentPage />} />

        {/* אדמין */}
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
        <Route path={ROUTES.SELECT_BUILDING} element={<BuildingSelect />} />
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
        <Route path={ROUTES.USER_DETAILS} element={<UserDetailsPage />} />

        {/* משתמשים */}
        <Route path={ROUTES.USER_LOGIN} element={<UserLogin />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.USER_DASHBOARD} element={<UserDashboard />} />

        {/* קבלה */}
        <Route path={ROUTES.RECEIPT} element={<ReceiptPage />} />

        {/* הצבעות */}
        <Route path={ROUTES.VOTING} element={<Voting />} />

        {/* קיר קהילה */}
        <Route path={ROUTES.COMMUNITY_WALL} element={<CommunityWall />} />

        {/* AI Dashboard */}
        <Route path={ROUTES.AI_DASHBOARD} element={<AIDashboard />} />

        {/* ניהול תשלומים */}
        <Route path={ROUTES.PAYMENT_MANAGEMENT} element={<PaymentManagement />} />

        {/* ניהול דירות */}
        <Route path={ROUTES.APARTMENT_MANAGEMENT} element={<ApartmentManagement />} />

        {/* דפים משפטיים */}
        <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
        <Route path={ROUTES.TERMS_AND_CONDITIONS} element={<TermsAndConditions />} />
        <Route path={ROUTES.ACCESSIBILITY} element={<Accessibility />} />
        <Route path={ROUTES.SECURITY_POLICY} element={<SecurityPolicy />} />

        {/* תודה */}
        <Route path={ROUTES.THANK_YOU} element={<ThankYouPage />} />

        {/* דוחות וסטטיסטיקה */}
        <Route path={ROUTES.REPORTS_DASHBOARD} element={<ReportsDashboard />} />

        {/* ניהול תחזוקה */}
        <Route path={ROUTES.MAINTENANCE_MANAGEMENT} element={<MaintenanceManagement />} />

        {/* הגדרות מערכת */}
        <Route path={ROUTES.SYSTEM_SETTINGS} element={<SystemSettings />} />
        <Route path={ROUTES.CONTRACTS_AND_LETTERS} element={<ContractsAndLetters />} />
        <Route path={ROUTES.SAFE_ZONE} element={<SafeZonePage />} />
        <Route path={ROUTES.B2B_REGISTER} element={<EnterpriseRegisterPage />} />
        <Route path={ROUTES.SALES_TOOLKIT} element={<SalesToolkitPage />} />

        {/* 404 – חייב להיות אחרון */}
        <Route path="*" element={<Error404Page />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
