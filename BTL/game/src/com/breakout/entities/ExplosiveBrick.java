package com.breakout.entities;

import java.awt.Color;
import java.util.List;

public class ExplosiveBrick extends Brick {
    private static final double EXPLOSION_RADIUS = 100;
    
    public ExplosiveBrick(double x, double y, double width, double height) {
    }
    
    public void explode(List<Brick> allBricks) {
        double centerX = getCenterX();
        double centerY = getCenterY();
        
    }
    
    @Override
    public void onDestroyed() {
        // Explosion handled by GameManager
    }
}
