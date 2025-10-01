package com.breakout.entities;

import com.breakout.core.GameObject;
import com.breakout.interfaces.Destructible;
import java.awt.*;

public class Brick extends GameObject implements Destructible {
    protected int durability;
    protected boolean destroyed;
    protected Color color;
    
    public Brick(double x, double y, double width, double height, int durability) {
    }
    
    private void setColorByDurability() {
    }
    
    @Override
    public boolean hit() {
    }
    
    @Override
    public boolean isDestroyed() {
        return destroyed;
    }
    
    @Override
    public void onDestroyed() {
        // Override in subclasses for special behavior
    }
    
    @Override
    public void update(double deltaTime) {
        // Bricks don't update
    }
    
    @Override
    public void draw(Graphics2D g) {
    }
}