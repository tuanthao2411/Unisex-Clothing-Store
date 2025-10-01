package com.breakout.entities;

import java.awt.Color;

public class UnbreakableBrick extends Brick {
    
    public UnbreakableBrick(double x, double y, double width, double height) {
    }
    
    @Override
    public boolean hit() {
        // Cannot be destroyed
        return false;
    }
}
