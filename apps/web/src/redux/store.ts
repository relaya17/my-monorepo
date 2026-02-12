import { configureStore } from '@reduxjs/toolkit';
import navbarReducer from './slice/navbarSlice';
import secondNavbarReducer from './slice/SecondNavbar';
import usersReducer from './slice/usersSlice';
import userDetailsReducer from './slice/userDetailsSlice';
import usersListReducer from './slice/usersListSlice';
import signUpReducer from './slice/signUpSlice';
import employeesReducer from './slice/employeesSlice';
import filesReducer from './slice/filesSlice';
import forRentReducer from './slice/forRentSlice';
import forSaleReducer from './slice/forSaleSlice';
import gardeningReducer from './slice/gardeningSlice';
import newResidentApprovalReducer from './slice/newResidentApprovalSlice';
import paymentReducer from './slice/PaymentSlice';
import poolMaintenanceReducer from './slice/poolMaintenanceSlice';
import repairTrackingReducer from './slice/repairTrackingSlice';
import residentsReducer from './slice/residentsSlice';
import settingsReducer from './slice/settingsSlice';
import votingReducer from './slice/votingSlice';
import receiptReducer from './reducers/receiptReducer';
import communityReducer from './slice/communitySlice';

export const store = configureStore({
  reducer: {
    navbar: navbarReducer,
    secondNavbar: secondNavbarReducer,
    users: usersReducer,
    userDetails: userDetailsReducer,
    usersList: usersListReducer,
    signUp: signUpReducer,
    employees: employeesReducer,
    files: filesReducer,
    forRent: forRentReducer,
    forSale: forSaleReducer,
    gardening: gardeningReducer,
    newResidentApproval: newResidentApprovalReducer,
    payment: paymentReducer,
    poolMaintenance: poolMaintenanceReducer,
    repairTracking: repairTrackingReducer,
    residents: residentsReducer,
    settings: settingsReducer,
    voting: votingReducer,
    receipt: receiptReducer,
    community: communityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
