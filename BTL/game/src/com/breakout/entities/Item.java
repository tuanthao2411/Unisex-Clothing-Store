package com.breakout.entities;

import com.breakout.core.MovableObject;

public abstract class Item extends MovableObject {
    protected static final double FALL_SPEED = 150;
    
    public Item(double x, double y, double width, double height) {
    }
    
    public void fall(double deltaTime) {
        move(deltaTime);
    }
    
    @Override
    public void update(double deltaTime) {
        fall(deltaTime);
    }
    
    public abstract void applyEffect(Paddle paddle, GameManager manager);
}