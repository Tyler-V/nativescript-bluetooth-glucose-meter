import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { EventData } from 'tns-core-modules/ui/page/page';
import * as bluetooth from 'nativescript-bluetooth';
import { RouterExtensions } from 'nativescript-angular/router';

@Component({
    selector: 'Home',
    moduleId: module.id,
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    isBluetoothEnabled: boolean;
    isScanning: boolean;
    peripherals: Array<bluetooth.Peripheral> = [];

    constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone, private routerExtensions: RouterExtensions) {}

    ngOnInit(): void {
        bluetooth.isBluetoothEnabled().then(enabled => (this.isBluetoothEnabled = enabled));
    }

    onTapEnableBluetooth() {
        bluetooth.enable().then(enabled => (this.isBluetoothEnabled = enabled));
    }

    onTapConnectDevice(peripheralUUID: string) {
        this.routerExtensions.navigate(['peripheral', peripheralUUID]);
    }

    onTapScan() {
        if (this.isScanning) {
            bluetooth.stopScanning().then(isStopped => (this.isScanning = isStopped));
        } else {
            this.peripherals = [];
            bluetooth
                .startScanning({
                    serviceUUIDs: [],
                    onDiscovered: peripheral => {
                        this.ngZone.run(() => {
                            this.isScanning = true;
                            if (!peripheral.name) return;
                            console.log('Peripheral found with UUID: ' + peripheral.UUID);
                            this.peripherals.push(peripheral);
                        });
                    },
                    skipPermissionCheck: false
                })
                .then(
                    success => {
                        console.log('Scanning complete');
                        this.isScanning = false;
                    },
                    error => {
                        console.log('Error while scanning: ' + error);
                        this.isScanning = false;
                    }
                );
        }
    }

    onTapPeripheral(peripheral: bluetooth.Peripheral) {
        console.log(peripheral);
        bluetooth.stopScanning().then(isStopped => (this.isScanning = isStopped));
        this.routerExtensions.navigate(['peripheral', peripheral.UUID]);
    }
}
