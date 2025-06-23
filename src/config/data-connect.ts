/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { FirebaseApp } from 'firebase/app';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect'

// TODO: Update your app's Firebase Data Connect configuration here.
const connectorConfig = {
    connector: "connector",
	location: "us-central1",
	service: "app",
}

export default (firebaseApp: FirebaseApp) => {
	
	const dataConnect = getDataConnect(firebaseApp, connectorConfig);
    if (process.env.DATA_CONNECT_EMULATOR_HOST) {
        // Connect to the local emulator
        connectDataConnectEmulator(
            dataConnect, 
            process.env.DATA_CONNECT_EMULATOR_HOST, 
            9399, 
            false
        );
    }
	return dataConnect;
};