package com.breakout.core;

import java.awt.Graphics2D;

/**
 * Abstract base class for all game objects
 */
public abstract class GameObject {
    protected double x, y;
    protected double width, height;
    
    public GameObject(double x, double y, double width, double height) {
    }
    
    // Getters & Setters
    public double getX() { return x; }
    public double getY() { return y; }
    public double getWidth() { }
    public double getHeight() { }
    public void setX(double x) { }
    public void setY(double y) { }
    
    public abstract void draw(Graphics2D g);
    public abstract void update(double deltaTime);
    
    public boolean intersects(GameObject other) {
    }
    
    public double getCenterX() {}
    public double getCenterY() {}
}