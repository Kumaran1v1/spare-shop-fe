import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { CustomThemeProvider } from './theme/CustomThemeProvider';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CustomThemeProvider>
    </Provider>
  );
};

export default App;
