import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import * as bluetooth from 'nativescript-bluetooth';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'Peripheral',
    moduleId: module.id,
    templateUrl: './peripheral.component.html'
})
export class PeripheralComponent implements OnInit, OnDestroy {
    uuid: string;
    peripheral: bluetooth.Peripheral;

    constructor(private ngZone: NgZone, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.uuid = this.route.snapshot.params['uuid'];
        console.log(this.uuid);
        bluetooth.connect({
            UUID: this.uuid,
            onConnected: (peripheral: bluetooth.Peripheral) => {
                console.log(peripheral);
                this.ngZone.run(() => {
                    this.peripheral = peripheral;
                });
            },
            onDisconnected: (peripheral: bluetooth.Peripheral) => {
                this.ngZone.run(() => {
                    this.peripheral = null;
                });
            }
        });
    }

    ngOnDestroy(): void {}

    onTapCharacteristic(service: bluetooth.Service, characteristic: bluetooth.Characteristic) {
        bluetooth
            .read({
                peripheralUUID: this.peripheral.UUID,
                serviceUUID: service.UUID,
                characteristicUUID: characteristic.UUID
            })
            .then(
                result => {
                    console.log('peripheralUUID: ' + this.peripheral.UUID);
                    console.log('serviceUUID: ' + service.UUID);
                    console.log('characteristicUUID: ' + characteristic.UUID);
                    console.log(result);
                    var data = new Uint8Array(result.value);
                    console.log(data);
                },
                error => {
                    console.log('Read error: ' + error);
                }
            );

        const GLUCOSE_SERVICE = '00001808-0000-1000-8000-00805f9b34fb';
        const GLUCOSE_CHARACTERISTIC = '00002a18-0000-1000-8000-00805f9b34fb';
        const RECORDS_CHARACTERISTIC = '00002a52-0000-1000-8000-00805f9b34fb';
        const CONTEXT_CHARACTERISTIC = '00002a34-0000-1000-8000-00805f9b34fb';

        setTimeout(() => {
            bluetooth
                .startNotifying({
                    peripheralUUID: this.uuid,
                    serviceUUID: GLUCOSE_SERVICE,
                    characteristicUUID: RECORDS_CHARACTERISTIC,
                    onNotify: result => {
                        console.log(result);
                    }
                })
                .then(() => {
                    console.log('RECORDS_CHARACTERISTIC - Subscribed for notifications');
                });
        }, 5000);

        setTimeout(() => {
            bluetooth
                .startNotifying({
                    peripheralUUID: this.uuid,
                    serviceUUID: GLUCOSE_SERVICE,
                    characteristicUUID: CONTEXT_CHARACTERISTIC,
                    onNotify: result => {
                        console.log('CONTEXT_CHARACTERISTIC: ' + result);
                    }
                })
                .then(() => {
                    console.log('CONTEXT_CHARACTERISTIC - Subscribed for notifications');
                });
        }, 7000);

        setTimeout(() => {
            bluetooth.stopNotifying({
                peripheralUUID: this.uuid,
                serviceUUID: GLUCOSE_SERVICE,
                characteristicUUID: GLUCOSE_CHARACTERISTIC
            });
            bluetooth
                .startNotifying({
                    peripheralUUID: this.uuid,
                    serviceUUID: GLUCOSE_SERVICE,
                    characteristicUUID: GLUCOSE_CHARACTERISTIC,
                    onNotify: result => {
                        console.log('GLUCOSE_CHARACTERISTIC: ' + new Uint8Array(result.value));
                    }
                })
                .then(function() {
                    console.log('GLUCOSE_MEASUREMENT - subscribed for notifications');
                });
        }, 8000);

        // https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/bluetooth/BluetoothGattDescriptor.java
        // https://github.com/EddyVerbruggen/nativescript-bluetooth/issues/134

        setTimeout(() => {
            bluetooth
                .write({
                    peripheralUUID: this.uuid,
                    serviceUUID: GLUCOSE_SERVICE,
                    characteristicUUID: RECORDS_CHARACTERISTIC,
                    value: ['0x01', '0x01']
                })
                .then(
                    result => {
                        console.log('Wrote to RECORDS_CHARACTERISTIC');
                    },
                    error => {
                        console.log('write error: ' + error);
                    }
                );
        }, 10000);

        // https://github.com/NightscoutFoundation/xDrip/blob/master/app/src/main/java/com/eveningoutpost/dexdrip/GlucoseMeter/GlucoseReadingRx.java

        // First glucose reading - 122 mg/dL 7/9/19 1:14pm
        // JS: GLUCOSE_CHARACTERISTIC: 3,0,0,227,7,7,9,17,14,1,16,255,122,176,241

        // Second glucose reading - 80 mg/dL 7/15/19 3:15pm
        // JS: GLUCOSE_CHARACTERISTIC: 3,1,0,227,7,7,15,19,15,44,16,255,80,176,241

        // Context characteristics
        // JS: GLUCOSE_CHARACTERISTIC: 6,0,1,1

        // Sequence: [1] = 0
        // Year: [4] << 8 | [3] = 2019
        // Month: [5] = 7
        // Day: [6] = 9
        // Hour: [7] = 17
        // Minute: [8] = 14
        // Second: [9] = 1
        // mg/dL: [10] = 122
    }
}
