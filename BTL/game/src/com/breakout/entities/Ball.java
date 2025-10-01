package com.breakout.entities;

import com.breakout.core.MovableObject;
import java.awt.*;

public class Ball extends MovableObject {
    private double radius;
    private static final double DEFAULT_SPEED = 300;
    
    public Ball(double x, double y, double radius) {
    }
    
    public void resetVelocity() {
    }
    
    public void resetPosition(double screenWidth, double screenHeight) {
    }
    
    @Override
    public void update(double deltaTime) {
    }
    
    @Override
    public void draw(Graphics2D g) {
    }
    
    public double getRadius() {}
}