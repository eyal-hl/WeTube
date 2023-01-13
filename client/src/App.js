import React from 'react';
import { UserContextProvider } from './contexts/UserContext';
import { SignalContextProvider } from './contexts/SignalContext';
import Routes from './Routes';
const dotenv = require('dotenv');
dotenv.config();

function App() {
	return (
		<UserContextProvider>
			<SignalContextProvider>
				<Routes />
			</SignalContextProvider>
		</UserContextProvider>
	);
}

export default App;
