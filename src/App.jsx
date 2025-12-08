import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useNotifications from "./hooks/useNotifications";
import autoLogoutService from "./services/autoLogoutService";
import Results from "./Views/admin/CreateSurvey/results";
import api from './utils/axiosConfig';

// Toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";ssw

// Estilos
import './Views/CSS/components.css';

// Vistas comunes
import {
  HomeGuest,
  LoginPage,
  RegisterPage,
  RecoverPassword,
  Logout,
  UpdatePassword,
  NotFound
} from './imports/commonImports';

// Vistas Admin
import {
  AdminAccountsList,
  CreateAccountForm,
  EditAccountPage,
  ListEventsA,
  EventDetailsA,
  CreateEvent,
  EditEvent,
  ListResource,
  CreateResource,
  Survey,
  CreateSurvay,
  Notifications,
  AdminImageDetail,
  AdminImageGallery,
  CalendarAdmin,
  ContractsAdmin,
  ContractsList,
  HomeAdmin
} from './imports/adminImports';

// Vistas Cliente
import {
  Schedule,
  EventDetailsC,
  ListEventsC,
  ClientSurvey,
  NotificationsClient,
  ImageGalleryC,
  ImageGalleryViewerC,
  CalendarClient,
  ContractsClient,
  HomeClient
} from './imports/clientImports';

// Configuración de rutas
const routeConfig = {
  public: [
    { path: '/Home', component: HomeGuest },
  ],
  publicOnly: [
    { path: '/Login', component: LoginPage },
    { path: '/Register', component: RegisterPage },
    { path: '/Recover', component: RecoverPassword },
  ],
  authenticated: [
    { path: '/Logout', component: Logout },
    { path: '/UpdatePassword', component: UpdatePassword },
  ],
  admin: [
    { path: '/HomeAdmin', component: HomeAdmin },
    { path: '/NotificationsAdmin', component: Notifications },
    // Recursos

    { path: '/HomeResources', component: ListResource },
    { path: '/CreateResource', component: CreateResource },

    // Encuestas
    { path: '/SurvayHome', component: Survey },
    { path: '/SurvayHome/create', component: CreateSurvay },
    
    // Galería
    { path: '/GalleryViewAdmin/:ImgId', component: AdminImageDetail },
    { path: '/GalleryAdmin', component: AdminImageGallery },

    // Cuentas de usuario
    { path: '/ManageAccounts', component: AdminAccountsList },
    { path: '/CreateAccount', component: CreateAccountForm },
    { path: '/ManageAccounts/edit/:userId', component: EditAccountPage },
    { path: '/CalendarAdmin', component: CalendarAdmin },

    // Contratos
    { path: '/SendContractsAdmin/:eventId', component: ContractsAdmin },
    { path: '/ListContracts', component: ContractsList },

    // Eventos
    { path: '/EventsHomeAdmin', component: ListEventsA },
    { path: '/EventsHomeAdmin/Details/:eventId', component: EventDetailsA },
    { path: '/CreateEvent', component: CreateEvent },
    { path: '/EditEvent/:eventId', component: EditEvent },
    { path: '/SurvayHome/results', component: Results },

  ],
  client: [
    { path: '/HomeClient', component: HomeClient },
    { path: '/Schedule', component: Schedule },
    { path: '/Survey/:eventId', component: ClientSurvey },
    { path: '/GalleryView/:ImgId', component: ImageGalleryViewerC },
    { path: '/Gallery', component: ImageGalleryC },
    { path: '/Calendar', component: CalendarClient },
    { path: '/HomeContracts', component: ContractsClient },
    { path: '/EventsHome/Details/:eventId', component: EventDetailsC },
    { path: '/EventsHome', component: ListEventsC },
    { path: '/Notification-tray', component: NotificationsClient },
  ]
};

// Hook de autenticación
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/auth/me')
      .then(res => {
        if (!mounted) return;
        if (res.data && res.data.user) {
          setIsAuthenticated(true);
          setUserRole(res.data.user.role);
          // store user in sessionStorage for components that still rely on it
          try { sessionStorage.setItem('user', JSON.stringify(res.data.user)); } catch (err) { console.warn('sessionStorage set failed', err); }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setIsAuthenticated(false);
        setUserRole(null);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return { isAuthenticated, userRole, loading };
};

// Protección de rutas
const ProtectedRoute = ({ children, requiredRole, userRole, isAuthenticated }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children, isAuthenticated }) => {
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// Redirección dinámica del "/"
const HomeRedirect = ({ isAuthenticated, userRole }) => {
  if (!isAuthenticated) return <Navigate to="/HomeGuest" replace />;
  if (userRole === "admin") return <Navigate to="/HomeAdmin" replace />;
  if (userRole === "user") return <Navigate to="/HomeClient" replace />;
  return <Navigate to="/HomeGuest" replace />;
};

// Renderizado dinámico de rutas
const renderRoutes = (routes = [], routeType, authProps = {}) => {
  return routes.map(({ path, component: Component }) => {
    const element = <Component />;
    switch (routeType) {
      case 'public':
        return <Route key={path} path={path} element={element} />;
      case 'publicOnly':
        return <Route key={path} path={path} element={<PublicOnlyRoute isAuthenticated={authProps.isAuthenticated}>{element}</PublicOnlyRoute>} />;
      case 'authenticated':
        return <Route key={path} path={path} element={<ProtectedRoute isAuthenticated={authProps.isAuthenticated}>{element}</ProtectedRoute>} />;
      case 'admin':
        return <Route key={path} path={path} element={<ProtectedRoute requiredRole="admin" userRole={authProps.userRole} isAuthenticated={authProps.isAuthenticated}>{element}</ProtectedRoute>} />;
      case 'user':
        return <Route key={path} path={path} element={<ProtectedRoute requiredRole="user" userRole={authProps.userRole} isAuthenticated={authProps.isAuthenticated}>{element}</ProtectedRoute>} />;
      case 'development':
        return <Route key={path} path={path} element={element} />;
      default:
        return null;
    }
  });
};

// Componente principal
function App() {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Notificaciones en tiempo real
  useNotifications();

  // Auto logout por inactividad
  useEffect(() => {
    if (isAuthenticated) {
      autoLogoutService.start(async () => {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          console.warn('Logout request failed', e);
        }
        try { sessionStorage.removeItem('user'); sessionStorage.removeItem('role'); sessionStorage.removeItem('name'); } catch(e){}
        window.location.href = '/login';
      }, 30 * 60 * 1000);
    }
    return () => autoLogoutService.stop();
  }, [isAuthenticated]);

  if (loading)
    return <div className="loading-container"><div>Cargando...</div></div>;

  const authProps = { isAuthenticated, userRole };

  return (
    <div className="Aplicacion">
      <BrowserRouter>
        <Routes>
          {/* Redirección automática según rol */}
          <Route path="/" element={<HomeRedirect {...authProps} />} />

          {/* Rutas normales */}
          {renderRoutes(routeConfig.public, 'public')}
          {renderRoutes(routeConfig.publicOnly, 'publicOnly', authProps)}
          {renderRoutes(routeConfig.authenticated, 'authenticated', authProps)}
          {renderRoutes(routeConfig.admin, 'admin', authProps)}
          {renderRoutes(routeConfig.client, 'user', authProps)}
          {renderRoutes(routeConfig.development, 'development')}

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
}

export default App;
