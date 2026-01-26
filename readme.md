MoreThanDyno

Use cases:
* Finding optimal shift points
* Recalculate top speed when changing gear ratio
* Comparing vehicle acceleration
* Comparing torque on engines with different redline

The different graphs:

* Thrust compensated for weight and air resistance.
  Wheel power/weight - air resistance.

* Thrust to weight ratio
  Wheel power/weight useful when gps top speed or drag is missing.

* Raw thrust
  Wheel power. Intereseting when comparing engine characteristics
  from vehicles with very different weights.

* Engine power/torque normalized by rpm
  Adds a gearbox to every engine and ensure that the outgoing axle
  spins at the same speed for all engines compared.

* Engine torque normalized by rpm
  Adds a gearbox to every engine and ensure that the outgoing axle
  spins at the same speed for all engines compared.

* Engine power / Engine Torque
  The traditional dyno graphs 

* Optimal shifting
  Shows the power band for each gear and when to shift.

* All gears
  Shows the wheel torque for all gears in a stacked graph


Example use case - recalculate top speed when changing gear ratios.

Add your vehicle, be sure to set top speed, but do not fill in drag.
Drag will be calculated from top speed and vice versa.

Clone your vehicle, remove the top speed but leave drag. Change gear
ratios to whatever you see fit. A new top speed will be calculated from 
the current gearing.

Hint: For maximum top speed, you want the top speed to be at the rpm
      that your engine produces the maximum power.


TODO:
Accumulate input power from x > 50 until y < 0
Accumulation must happen in the same steps.
