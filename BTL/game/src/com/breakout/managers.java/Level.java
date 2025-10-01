package com.breakout.managers;

import com.breakout.entities.*;
import java.util.*;

public class Level {
    private List<Brick> bricks;
    private int levelNumber;
    
    public Level(int levelNumber) {
        this.levelNumber = levelNumber;
        this.bricks = new ArrayList<>();
    }
    
    public void loadLevel(int screenWidth) {
        bricks.clear();
        
        int rows = 5 + levelNumber;
        int cols = 10;
        double brickWidth = screenWidth / cols;
        double brickHeight = 20;
        
    }
    
    public boolean isCleared() {
        for (Brick brick : bricks) {
            if (!brick.isDestroyed() && !(brick instanceof UnbreakableBrick)) {
                return false;
            }
        }
        return true;
    }
    
    public List<Brick> getBricks() { return bricks; }
    public int getLevelNumber() { return levelNumber; }
}