package com.breakout.interfaces;

public interface Controllable {
    void moveLeft(double deltaTime);
    void moveRight(double deltaTime);
    void handleInput(boolean leftPressed, boolean rightPressed, double deltaTime);
}