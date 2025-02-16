/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../../service/client.service';
import { NiFiCommon } from '../../../service/nifi-common.service';
import {
    ControllerServiceCreator,
    ControllerServiceEntity,
    CreateControllerServiceRequest,
    PropertyDescriptorRetriever
} from '../../../state/shared';
import { ConfigureControllerServiceRequest, DeleteControllerServiceRequest } from '../state/controller-services';

@Injectable({ providedIn: 'root' })
export class ControllerServiceService implements ControllerServiceCreator, PropertyDescriptorRetriever {
    private static readonly API: string = '../nifi-api';

    constructor(
        private httpClient: HttpClient,
        private client: Client,
        private nifiCommon: NiFiCommon
    ) {}

    getControllerServices(processGroupId: string): Observable<any> {
        const uiOnly: any = { uiOnly: true };
        return this.httpClient.get(
            `${ControllerServiceService.API}/flow/process-groups/${processGroupId}/controller-services`,
            {
                params: uiOnly
            }
        );
    }

    getBreadcrumbs(processGroupId: string): Observable<any> {
        return this.httpClient.get(`${ControllerServiceService.API}/flow/process-groups/${processGroupId}/breadcrumbs`);
    }

    getControllerService(id: string): Observable<any> {
        return this.httpClient.get(`${ControllerServiceService.API}/controller-services/${id}`);
    }

    createControllerService(createControllerService: CreateControllerServiceRequest): Observable<any> {
        if (createControllerService.processGroupId) {
            const processGroupId: string = createControllerService.processGroupId;
            return this.httpClient.post(
                `${ControllerServiceService.API}/process-groups/${processGroupId}/controller-services`,
                {
                    revision: createControllerService.revision,
                    component: {
                        bundle: createControllerService.controllerServiceBundle,
                        type: createControllerService.controllerServiceType
                    }
                }
            );
        }
        return EMPTY;
    }

    getPropertyDescriptor(id: string, propertyName: string, sensitive: boolean): Observable<any> {
        const params: any = {
            propertyName,
            sensitive
        };
        return this.httpClient.get(`${ControllerServiceService.API}/controller-services/${id}/descriptors`, {
            params
        });
    }

    updateControllerService(configureControllerService: ConfigureControllerServiceRequest): Observable<any> {
        return this.httpClient.put(
            this.nifiCommon.stripProtocol(configureControllerService.uri),
            configureControllerService.payload
        );
    }

    deleteControllerService(deleteControllerService: DeleteControllerServiceRequest): Observable<any> {
        const entity: ControllerServiceEntity = deleteControllerService.controllerService;
        const revision: any = this.client.getRevision(entity);
        return this.httpClient.delete(this.nifiCommon.stripProtocol(entity.uri), { params: revision });
    }
}
