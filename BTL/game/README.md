This README describes the folder layout and purpose of the main packages and files in the Breakout game project.

```
src/
 └─ com/
    └─ breakout/
       ├─ entities/          # Game entities (Ball, Paddle, Bricks, Items)
       │   ├─ Ball.java
       │   ├─ Brick.java
       │   ├─ ExplosiveBrick.java
       │   ├─ UnbreakableBrick.java
       │   └─ ... (other entity classes)
       ├─ items/             # Power-ups / items
       │   ├─ ExpandPaddle.java
       │   ├─ Laser.java
       │   ├─ MultiBall.java
       │   └─ ... (other items)
       ├─ interfaces/        # Interfaces used by entities (e.g., Destructible)
       │   └─ Destructible.java
       ├─ managers/          # Manager classes (e.g., GameManager, Level)
       │   ├─ GameManager.java
       │   └─ Level.java
       ├─ Main.java          # Application entry point
       └─ README.md          # (this file)
```

## File highlights

- **Main.java** — The entry point for launching the game (contains `public static void main(String[] args)`).
- **Ball.java** — Handles ball physics and collisions.
- **Paddle.java** — Player paddle control and rendering.
- **Brick.java / ExplosiveBrick.java / UnbreakableBrick.java** — Different brick behaviors and hit logic.
- **Item classes (ExpandPaddle, MultiBall, Laser)** — Power-ups dropped by bricks; each class implements its effect.
- **Destructible.java** — Interface for objects that can be destroyed (bricks, certain items).
- **GameManager.java / Level.java** — Game lifecycle, level loading, score, lives, spawning items.