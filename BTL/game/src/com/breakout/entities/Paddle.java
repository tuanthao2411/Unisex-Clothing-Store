package com.breakout.entities;

import com.breakout.core.GameObject;
import com.breakout.interfaces.Controllable;
import java.awt.*;

public class Paddle extends GameObject implements Controllable {
    private static final double SPEED = 400;
    private double screenWidth;
    
    public Paddle(double x, double y, double width, double height, double screenWidth) {
    }
    
    @Override
    public void moveLeft(double deltaTime) {
    }
    
    @Override
    public void moveRight(double deltaTime) {
    }
    
    @Override
    public void handleInput(boolean leftPressed, boolean rightPressed, double deltaTime) {
    }
    
    @Override
    public void update(double deltaTime) {
        // Handled by input
    }
    
    @Override
    public void draw(Graphics2D g) {
    }
    
    public void expand(double amount) {
    }
}
