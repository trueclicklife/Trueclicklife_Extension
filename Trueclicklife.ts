enum PingUnit {
    //% block="μs"
    MicroSeconds,
    //% block="cm"
    Centimeters,
    //% block="inches"
    Inches
}

//% weight=10 color=#0fbc11 icon="\uf1b9" groups='["Basic_Sensor","Motor & time","Motor On","Ultrasonic Sensor","Tracking Sensor", "Advance"]'
namespace Trueclicklife {

    //% block="value of light: %ligs"
    //% group="Basic_Sensor"
    //% weight=7
    export function lightsensor(ligs: AnalogPin) {
        return pins.analogReadPin(ligs)
    }

    //% block="value of soil: %sois"
    //% group="Basic_Sensor"
    //% weight=6
    export function soilsensor(sois: AnalogPin) {
        return pins.analogReadPin(sois)
    }

    //% block="value of raindrop: %rais"
    //% group="Basic_Sensor"
    //% weight=5
    export function rainsensor(rais: AnalogPin) {
        return pins.analogReadPin(rais)
    }

    //% block="value of Infrared(IR): %is"
    //% group="Basic_Sensor"
    //% weight=4
    export function irsensor(irs: AnalogPin) {
        return pins.analogReadPin(irs)
    }

    //% block="value of water level: %wats"
    //% group="Basic_Sensor"
    //% weight=3
    export function watersensor(wats: AnalogPin) {
        return pins.analogReadPin(wats)
    }

    export enum DHT11Type {
        //% block="temperature(℃)" enumval=0
        DHT11_temperature_C,

        //% block="temperature(℉)" enumval=1
        DHT11_temperature_F,

        //% block="humidity(0~100)" enumval=2
        DHT11_humidity,
    }

    let dht11Humidity = 0
    let dht11Temperature = 0

    /**
     * get dht11 temperature and humidity Value
     * @param dht11pin describe parameter here, eg: DigitalPin.P15
     */
    //% group="Basic_Sensor"
    //% weight=2
    //% blockId="readdht11" block="value of dht11: %dht11type| at pin %dht11pin"
    export function dht11value(dht11type: DHT11Type, dht11pin: DigitalPin): number {
        const DHT11_TIMEOUT = 100
        const buffer = pins.createBuffer(40)
        const data = [0, 0, 0, 0, 0]
        let startTime = control.micros()

        if (control.hardwareVersion().slice(0, 1) !== '1') { // V2
            // TODO: V2 bug
            pins.digitalReadPin(DigitalPin.P0);
            pins.digitalReadPin(DigitalPin.P1);
            pins.digitalReadPin(DigitalPin.P2);
            pins.digitalReadPin(DigitalPin.P3);
            pins.digitalReadPin(DigitalPin.P4);
            pins.digitalReadPin(DigitalPin.P10);

            // 1.start signal
            pins.digitalWritePin(dht11pin, 0)
            basic.pause(18)

            // 2.pull up and wait 40us
            pins.setPull(dht11pin, PinPullMode.PullUp)
            pins.digitalReadPin(dht11pin)
            control.waitMicros(40)

            // 3.read data
            startTime = control.micros()
            while (pins.digitalReadPin(dht11pin) === 0) {
                if (control.micros() - startTime > DHT11_TIMEOUT) break
            }
            startTime = control.micros()
            while (pins.digitalReadPin(dht11pin) === 1) {
                if (control.micros() - startTime > DHT11_TIMEOUT) break
            }

            for (let dataBits = 0; dataBits < 40; dataBits++) {
                startTime = control.micros()
                while (pins.digitalReadPin(dht11pin) === 1) {
                    if (control.micros() - startTime > DHT11_TIMEOUT) break
                }
                startTime = control.micros()
                while (pins.digitalReadPin(dht11pin) === 0) {
                    if (control.micros() - startTime > DHT11_TIMEOUT) break
                }
                control.waitMicros(28)
                if (pins.digitalReadPin(dht11pin) === 1) {
                    buffer[dataBits] = 1
                }
            }
        } else { // V1
            // 1.start signal
            pins.digitalWritePin(dht11pin, 0)
            basic.pause(18)

            // 2.pull up and wait 40us
            pins.setPull(dht11pin, PinPullMode.PullUp)
            pins.digitalReadPin(dht11pin)
            control.waitMicros(40)

            // 3.read data
            if (pins.digitalReadPin(dht11pin) === 0) {
                while (pins.digitalReadPin(dht11pin) === 0);
                while (pins.digitalReadPin(dht11pin) === 1);

                for (let dataBits = 0; dataBits < 40; dataBits++) {
                    while (pins.digitalReadPin(dht11pin) === 1);
                    while (pins.digitalReadPin(dht11pin) === 0);
                    control.waitMicros(28)
                    if (pins.digitalReadPin(dht11pin) === 1) {
                        buffer[dataBits] = 1
                    }
                }
            }
        }

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                if (buffer[8 * i + j] === 1) {
                    data[i] += 2 ** (7 - j)
                }
            }
        }

        if (((data[0] + data[1] + data[2] + data[3]) & 0xff) === data[4]) {
            dht11Humidity = data[0] + data[1] * 0.1
            dht11Temperature = data[2] + data[3] * 0.1
        }

        switch (dht11type) {
            case DHT11Type.DHT11_temperature_C:
                return dht11Temperature
            case DHT11Type.DHT11_temperature_F:
                return (dht11Temperature * 1.8) + 32
            case DHT11Type.DHT11_humidity:
                return dht11Humidity
        }
    }




    //% block="Forward Speed: %value time: %number \\sec"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Motor weight=9
    export function forwardfor(value: number, time: number) {
        pins.analogWritePin(AnalogPin.P13, value * 10.2)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, value * 10.2)
        pins.analogWritePin(AnalogPin.P16, 0)
        basic.pause(time * 1000)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)

    }

    //% block="Back Speed: %value time: %number sec"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Motor weight=8
    export function backfor(value: number, time: number) {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, value * 10.2)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, value * 10.2)
        basic.pause(time * 1000)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)

    }



    //% block="Turn Left Speed: %value time: %number sec"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Motor weight=7
    export function turnleftfor(value: number, time: number) {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, value * 10.2)
        pins.analogWritePin(AnalogPin.P16, 0)
        basic.pause(time * 1000)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)

    }

    //% block="Turn Right Speed: %value time: %number sec"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Motor weight=6
    export function turnrightfor(value: number, time: number) {
        pins.analogWritePin(AnalogPin.P13, value * 10.2)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)
        basic.pause(time * 1000)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)

    }

    //% block="Forward|Speed: %value"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Motor weight=5
    export function forward(value: number) {
        pins.analogWritePin(AnalogPin.P13, value * 10.2)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, value * 10.2)
        pins.analogWritePin(AnalogPin.P16, 0)
    }

    //% block="Back|Speed: %value"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Motor weight=4
    export function back(value: number) {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, value * 10.2)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, value * 10.2)
    }

    //% block="Turn Left|Speed: %value"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Motor weight=3
    export function turnleft(value: number) {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, value * 10.2)
        pins.analogWritePin(AnalogPin.P16, 0)
    }

    //% block="Turn Right|Speed: %value"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Motor weight=2
    export function turnright(value: number) {
        pins.analogWritePin(AnalogPin.P13, value * 10.2)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)
    }

    //% block="Stop"
    //% subcategory=SmartCar_Motor weight=1
    export function stop() {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)
    }

    //% block="ping trig %trig|echo %echo|unit %unit"
    //% group="Basic_Sensor"
    //% weight=1
    export function ping(trig: DigitalPin, echo: DigitalPin, unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case PingUnit.Centimeters: return Math.idiv(d, 58);
            case PingUnit.Inches: return Math.idiv(d, 148);
            default: return d;
        }
    }

    //% block="Left sensor: %ls"
    //% subcategory=SmartCar_Track weight=2
    export function leftsensor(ls: AnalogPin) {
        return pins.analogReadPin(ls)
    }

    //% block="Right sensor: %rs"
    //% subcategory=SmartCar_Track weight=1
    export function rightsensor(rs: AnalogPin) {
        return pins.analogReadPin(rs)
    }


    //% block="Forward M1|Speed: %motor1 M2|Speed: %motor2"
    //% motor1.min=0 motor1.max=100
    //% motor2.min=0 motor2.max=100
    //% subcategory=SmartCar_Avd weight=8
    export function forwardadvance(motor1: number, motor2: number) {
        pins.analogWritePin(AnalogPin.P13, motor1 * 10.2)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, motor2 * 10.2)
        pins.analogWritePin(AnalogPin.P16, 0)
    }

    //% block="Back M1|Speed: %motor1 M2|Speed: %motor2"
    //% motor1.min=0 motor1.max=100
    //% motor2.min=0 motor2.max=100
    //% subcategory=SmartCar_Avd weight=7
    export function backadvance(motor1: number, motor2: number) {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, motor1 * 10.2)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, motor2 * 10.2)
    }

    //% block="Spin Left|Speed: %value"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Avd weight=6
    export function spinleft(value: number) {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, value * 10.2)
        pins.analogWritePin(AnalogPin.P15, value * 10.2)
        pins.analogWritePin(AnalogPin.P16, 0)
    }

    //% block="Spin Right|Speed: %value"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Avd weight=5
    export function spinright(value: number) {
        pins.analogWritePin(AnalogPin.P13, value * 10.2)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, value * 10.2)
    }

    //% block="Forward M1|Speed: %motor1 M2|Speed: %motor2 time: %number sec"
    //% motor1.min=0 motor1.max=100
    //% motor2.min=0 motor2.max=100
    //% subcategory=SmartCar_Avd weight=4
    export function forwardforadvance(motor1: number, motor2: number, time: number) {
        pins.analogWritePin(AnalogPin.P13, motor1 * 10.2)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, motor2 * 10.2)
        pins.analogWritePin(AnalogPin.P16, 0)
        basic.pause(time * 1000)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)
    }



    //% block="Back M1|Speed: %motor1 M2|Speed: %motor2 time: %number sec"
    //% motor1.min=0 motor1.max=100
    //% motor2.min=0 motor2.max=100
    //% subcategory=SmartCar_Avd weight=3
    export function backforadvance(motor1: number, motor2: number, time: number) {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, motor1 * 10.2)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, motor2 * 10.2)
        basic.pause(time * 1000)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)

    }


    //% block="Spin Left Speed: %value time: %number sec"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Avd weight=2
    export function spinleftfor(value: number, time: number) {
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, value * 10.2)
        pins.analogWritePin(AnalogPin.P15, value * 10.2)
        pins.analogWritePin(AnalogPin.P16, 0)
        basic.pause(time * 1000)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)

    }



    //% block="Spin Right Speed: %value time: %number sec"
    //% value.min=0 value.max=100
    //% subcategory=SmartCar_Avd weight=1
    export function spinrightfor(value: number, time: number) {
        pins.analogWritePin(AnalogPin.P13, value * 10.2)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, value * 10.2)
        basic.pause(time * 1000)
        pins.analogWritePin(AnalogPin.P13, 0)
        pins.analogWritePin(AnalogPin.P14, 0)
        pins.analogWritePin(AnalogPin.P15, 0)
        pins.analogWritePin(AnalogPin.P16, 0)

    }


}
