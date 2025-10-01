package com.breakout.core;

/**
 * Abstract class for movable objects
 */
public abstract class MovableObject extends GameObject {
    protected double vx, vy;
    
    public MovableObject(double x, double y, double width, double height) {
    }
    
    public void move(double deltaTime) {
    }
    
    public void bounceX() { }
    public void bounceY() { }
    
    public double getVx() { }
    public double getVy() { }
    public void setVx(double vx) { }
    public void setVy(double vy) { }
}