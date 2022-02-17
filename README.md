# Elevators

Elevator System design exercise.

## Problem Statement

Consider the problem of programming an elevator in a ten floor building with a single elevator. Each floor has two buttons to call the elevator to the floor to take you up or down.
Write code to implement the following:

- User interactions from outside the elevator (pressing up/down buttons)
- User interactions from within the elevator (pressing a button for a floor)
- The elevator moving up and down in response to user actions

## Assumptions

1. A1: The system can have one or more elevator cars.
2. A2: All elevator cars can serve each floor in the building, no express cars.
3. A3: Elevator movement management should prioritize serving the current direction of movement.
4. A4: Elevator movement management should attempt to optimize for quick summon (fewer movements) as long as assumption A3 is upheld.
5. A5: The system should prioritize passenger experience over potential power savings.
6. A6: Elevator movement management should account for time needed for passengers to board/disembark.
