package com.breakout.items;

import com.breakout.entities.*;
import java.awt.*;

public class MultiBall extends Item {
    
    public MultiBall(double x, double y) {
    }
    
    @Override
    public void applyEffect(Paddle paddle, GameManager manager) {
        manager.addExtraBall();
    }
    
    @Override
    public void draw(Graphics2D g) {
    }
}
