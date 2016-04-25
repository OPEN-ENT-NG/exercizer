/// <reference path="../app.ts" />

namespace API.Client {
    'use strict';

    export interface User {

        /**
         * Id of the user.
         */
            "id"?: number;

        /**
         * First name of the user.
         */
            "firstName"?: string;

        /**
         * Last name of the user.
         */
            "lastName"?: string;

    }

}