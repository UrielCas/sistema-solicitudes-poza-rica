import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './core/network/queryClient';
import { AppRouter } from './routes/AppRouter';
// Registra la sesión en el cliente HTTP antes de la primera petición.
import './features/auth/di';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}
