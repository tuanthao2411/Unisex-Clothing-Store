package com.breakout;

import com.breakout.managers.*;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class Main extends JPanel implements KeyListener {
    private static final int WIDTH = 800;
    private static final int HEIGHT = 600;
    private static final int FPS = 60;
    
    private GameManager gameManager;
    private Renderer renderer;
    private boolean leftPressed, rightPressed;
    private long lastTime;
    
    public Main() {
    }
    
    @Override
    protected void paintComponent(Graphics g) {
    }
    
    public void gameLoop() {
    }
    
    @Override
    public void keyPressed(KeyEvent e) {
    }
    
    @Override
    public void keyReleased(KeyEvent e) {
    }
    
    @Override
    public void keyTyped(KeyEvent e) {}
    
    public static void main(String[] args) {
    }
}