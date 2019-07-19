import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular/router';
import { PeripheralComponent } from './peripheral.component';

const routes: Routes = [{ path: ':uuid', component: PeripheralComponent }];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class PheripheralRoutingModule {}
