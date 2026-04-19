import { configureStore } from '@reduxjs/toolkit';
import navbarReducer from './slice/navbarSlice';
import secondNavbarReducer from './slice/SecondNavbar';
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
import visionReducer from './slice/visionSlice';
import ceoReducer from './slice/ceoSlice';

export const store = configureStore({
  reducer: {
    navbar: navbarReducer,
    secondNavbar: secondNavbarReducer,
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
    vision: visionReducer,
    ceo: ceoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
