package com.breakout.interfaces;

public interface Destructible {
    boolean hit();
    boolean isDestroyed();
    void onDestroyed();
}