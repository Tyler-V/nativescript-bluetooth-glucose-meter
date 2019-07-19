import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { PheripheralRoutingModule } from "./peripheral-routing.module";
import { PeripheralComponent } from "./peripheral.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        PheripheralRoutingModule
    ],
    declarations: [
        PeripheralComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class PheripheralModule { }
