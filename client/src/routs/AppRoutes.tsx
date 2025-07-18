import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ROUTES from "../routs/routes";

// דפים ראשיים
import Home from "../pages/Home";
import Error404Page from "../pages/404/Error404Page";
import ThankYouPage from "../pages/thankyou/Thankyou";

// דפים של דיירים
import ResidentForm from "../pages/ResidentForm";
import NewResidentApproval from "../pages/NewResidentApproval";
import ResidentHome from "../pages/ResidentHome";

// דפים של תחזוקה
import Gardening from "../pages/Gardening";
import RepairTracking from "../pages/RepairTracking";

// דפים של עובדים
import EmployeeManagement from "../pages/EmployeeManagement";

// דירות
import ForRent from "../pages/ForRent";
import ForSale from "../pages/ForSale";

// דפים משפטיים
import PrivacyPolicy from "../pages/seqerty/PrivacyPolicy";
import TermsAndConditions from "../pages/seqerty/TermsAndConditions";

// משתמשים והרשאות
import SignUpPage from "../pages/users/UI/SignUpPage";
import UsersListPage from "../pages/users/UI/UsersListPage";
import UserDetailsPage from "../pages/users/UI/UserDetailsPage";
import UsersPage from "../pages/users/UI/UsersPage";
import UserManagement from "../pages/users/UI/UserManagement";
import CreateAdminPassword from "../pages/users/UI/CreateAdminPassword";
import ChangeAdminPassword from "../pages/users/UI/ChangeAdminPassword";

// תשלום
import CheckOutPage from "../pages/CheckOutPage";
import PaymentPage from "../pages/PaymentPage";

// אדמין
import AdminDashboard from "../pages/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import ChangePassword from "../pages/ChangePassword";

// משתמשים
import UserLogin from "../pages/UserLogin";
import UserDashboard from "../pages/UserDashboard";

// קבלה
import ReceiptPage from "../pages/ReceiptPage";

// הצבעות
import Voting from "../components/Voting";

// קיר קהילה
import CommunityWall from "../pages/CommunityWall";

// AI Dashboard
import AIDashboard from "../pages/AIDashboard";

// ניהול תשלומים
import PaymentManagement from "../pages/PaymentManagement";

// ניהול דירות
import ApartmentManagement from "../pages/ApartmentManagement";

// דוחות וסטטיסטיקה
import ReportsDashboard from "../pages/ReportsDashboard";

// ניהול תחזוקה
import MaintenanceManagement from "../pages/MaintenanceManagement";

// הגדרות מערכת
import SystemSettings from "../pages/SystemSettings";

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
    <Routes>
      {/* דף הבית */}
      <Route path={ROUTES.HOME} element={<Home />} />

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
      <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
      <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
      <Route path={ROUTES.USER_DETAILS} element={<UserDetailsPage />} />

      {/* משתמשים */}
      <Route path={ROUTES.USER_LOGIN} element={<UserLogin />} />
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

      {/* תודה + 404 */}
      <Route path={ROUTES.THANK_YOU} element={<ThankYouPage />} />
      <Route path="*" element={<Error404Page />} />

      {/* דוחות וסטטיסטיקה */}
      <Route path={ROUTES.REPORTS_DASHBOARD} element={<ReportsDashboard />} />

      {/* ניהול תחזוקה */}
      <Route path={ROUTES.MAINTENANCE_MANAGEMENT} element={<MaintenanceManagement />} />

      {/* הגדרות מערכת */}
      <Route path={ROUTES.SYSTEM_SETTINGS} element={<SystemSettings />} />
    </Routes>
  );
};

export default AppRoutes;
