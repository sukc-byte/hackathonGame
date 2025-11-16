import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.gridSize = 8;
        this.tileSize = 80;
        this.player = null;
        this.boxes = [];
        this.targets = [];
        this.currentLevel = 0;
        this.moveCount = 0;
        
        this.particles = [];
        
        this.recognition = null;
        this.isRecognitionActive = false;
        
        this.voiceAssistanceEnabled = true;
        this.speechRate = 1.3;
        this.speechVolume = 1.0;
        
        this.audioContext = null;
        
        this.instructionPanel = null;
        this.instructionText = null;
        this.instructionTitle = null;
        this.instructionPanelVisible = true;
    }

    preload() {
        console.log('Preloading...');
    }

    create() {
        console.log('Game Created!');
        
        this.createBackground();
        this.createParticles();
        this.initAudio();
        this.setupKeyboardControls();
        this.setupScreenReader();
        this.createUI();
        this.createInstructionPanel();
        this.loadLevel(0);
        
        this.time.delayedCall(1000, () => {
            this.setupVoiceControls();
        });
        
        this.time.delayedCall(2000, () => {
            this.speakText('Welcome to Adaptive Game. Use arrow keys, WASD, or voice commands to play. Say help for instructions.');
        });
    }

    update() {
        // Game loop
    }

    createBackground() {
        const gradient = this.add.graphics();
        
        for (let i = 0; i < 640; i += 10) {
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                {r: 26, g: 26, b: 46},
                {r: 15, g: 52, b: 96},
                640,
                i
            );
            const colorHex = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
            gradient.fillStyle(colorHex);
            gradient.fillRect(0, i, 960, 10);
        }
        
        this.createStars();
    }

    createStars() {
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, 960);
            const y = Phaser.Math.Between(0, 640);
            const star = this.add.circle(x, y, 1, 0xffffff, 0.6);
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createParticles() {
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, 640),
                Phaser.Math.Between(0, 640),
                Phaser.Math.Between(2, 4),
                0x4ecdc4,
                0.3
            );
            
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(100, 300),
                duration: Phaser.Math.Between(5000, 10000),
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
            
            this.particles.push(particle);
        }
    }

    createInstructionPanel() {
        const panelWidth = 280;
        const panelHeight = 580;
        const panelX = 640 + panelWidth / 2 + 20;
        const panelY = 320;
        
        this.instructionPanel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0f3460, 0.95);
        this.instructionPanel.setStrokeStyle(3, 0x4ecdc4, 1);
        this.instructionPanel.setDepth(1000);
        
        this.instructionTitle = this.add.text(panelX, 50, '📖 INSTRUCTIONS', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#4ecdc4',
            fontStyle: 'bold',
            align: 'center'
        });
        this.instructionTitle.setOrigin(0.5);
        this.instructionTitle.setDepth(1001);
        
        const instructionsText = `
🎮 KEYBOARD CONTROLS:
⬆️ ⬇️ ⬅️ ➡️  Arrow Keys
W A S D  Move Player

🎤 VOICE COMMANDS:
Say "move up"
Say "move down"
Say "move left"
Say "move right"
Say "restart"
Say "help"
Say "status"

⌨️ SHORTCUTS:
R - Restart Level
H - Hear Help
V - Toggle Voice
I - Show/Hide Info

🎯 GAME RULES:
• Push orange boxes
• Onto blue targets
• All boxes must be
  on targets to win

🔊 SOUNDS:
• Beep = Move
• Boop = Push Box
• Ding = Box on Target
• Melody = Level Win

♿ ACCESSIBILITY:
Fully accessible for:
• Blind players
• Deaf players
• Motor-impaired
• Everyone!
        `;
        
        this.instructionText = this.add.text(panelX, panelY + 30, instructionsText, {
            fontSize: '14px',
            fontFamily: 'Courier New, monospace',
            color: '#ffffff',
            align: 'left',
            lineSpacing: 4
        });
        this.instructionText.setOrigin(0.5);
        this.instructionText.setDepth(1001);
    }

    toggleInstructionPanel() {
        this.instructionPanelVisible = !this.instructionPanelVisible;
        
        if (this.instructionPanel) {
            this.instructionPanel.setVisible(this.instructionPanelVisible);
        }
        if (this.instructionText) {
            this.instructionText.setVisible(this.instructionPanelVisible);
        }
        if (this.instructionTitle) {
            this.instructionTitle.setVisible(this.instructionPanelVisible);
        }
        
        const status = this.instructionPanelVisible ? 'shown' : 'hidden';
        this.speakText(`Instructions ${status}`);
    }

    getLevels() {
        return [
            {
                name: "Getting Started",
                grid: [
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 3, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0]
                ]
            },
            {
                name: "Double Trouble",
                grid: [
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0, 0, 0, 0],
                    [0, 0, 2, 0, 0, 3, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 2, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 3, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0]
                ]
            },
            {
                name: "The Puzzle",
                grid: [
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0, 0, 0],
                    [0, 0, 2, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 2, 0, 0, 0],
                    [0, 0, 0, 0, 0, 2, 0, 0],
                    [0, 3, 0, 0, 0, 0, 0, 0],
                    [0, 0, 3, 0, 0, 0, 3, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0]
                ]
            }
        ];
    }

    loadLevel(levelIndex) {
        const levels = this.getLevels();
        
        if (levelIndex >= levels.length) {
            this.announceVictory();
            return;
        }
        
        this.currentLevel = levelIndex;
        const level = levels[levelIndex];
        this.moveCount = 0;
        
        if (this.player) {
            if (this.player.glow) this.player.glow.destroy();
            if (this.player.sparkle) this.player.sparkle.destroy();
            this.player.destroy();
        }
        
        this.boxes.forEach(box => {
            if (box.glow) box.glow.destroy();
            box.destroy();
        });
        
        this.targets.forEach(target => {
            if (target.glow) target.glow.destroy();
            if (target.ring) target.ring.destroy();
            target.destroy();
        });
        
        this.boxes = [];
        this.targets = [];
        
        this.createGrid(level.grid);
        this.updateUI();
        
        const announcement = `Level ${levelIndex + 1}: ${level.name}. You have ${this.boxes.length} ${this.boxes.length === 1 ? 'box' : 'boxes'} to push onto targets. Good luck!`;
        this.speakText(announcement);
        this.playSound('start');
    }

    createGrid(grid) {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const x = col * this.tileSize + this.tileSize / 2;
                const y = row * this.tileSize + this.tileSize / 2;
                const cell = grid[row][col];
                
                const gridSquare = this.add.rectangle(x, y, this.tileSize - 2, this.tileSize - 2, 0x16213e);
                gridSquare.setStrokeStyle(2, 0x0f3460, 0.8);
                gridSquare.setDepth(0);
                
                if (cell === 3) {
                    this.createTarget(x, y, row, col);
                }
            }
        }
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const x = col * this.tileSize + this.tileSize / 2;
                const y = row * this.tileSize + this.tileSize / 2;
                const cell = grid[row][col];
                
                if (cell === 2) {
                    this.createBox(x, y, row, col);
                } else if (cell === 1) {
                    this.createPlayer(x, y, row, col);
                }
            }
        }
    }

    createPlayer(x, y, row, col) {
        const glow = this.add.circle(x, y, 40, 0xffff00, 0.5);
        glow.setDepth(1);
        this.tweens.add({
            targets: glow,
            scale: 1.3,
            alpha: 0.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.player = this.add.rectangle(x, y, this.tileSize - 10, this.tileSize - 10, 0x00ff00);
        this.player.setStrokeStyle(4, 0xffff00, 1);
        this.player.setDepth(10);
        this.player.row = row;
        this.player.col = col;
        this.player.glow = glow;
        
        const sparkle = this.add.star(x, y, 5, 10, 20, 0xffffff, 0.9);
        sparkle.setDepth(11);
        this.tweens.add({
            targets: sparkle,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });
        this.player.sparkle = sparkle;
    }

    createBox(x, y, row, col) {
        const glow = this.add.circle(x, y, 40, 0xff6b35, 0.3);
        glow.setDepth(1);
        
        const box = this.add.rectangle(x, y, this.tileSize - 15, this.tileSize - 15, 0xff6b35);
        box.setStrokeStyle(3, 0xff4500, 0.8);
        box.setDepth(10);
        box.row = row;
        box.col = col;
        box.onTarget = false;
        box.glow = glow;
        
        this.boxes.push(box);
    }

    createTarget(x, y, row, col) {
        const glow = this.add.circle(x, y, 35, 0x4ecdc4, 0.3);
        glow.setDepth(0);
        this.tweens.add({
            targets: glow,
            scale: 1.3,
            alpha: 0.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        const target = this.add.circle(x, y, this.tileSize / 3, 0x4ecdc4);
        target.setStrokeStyle(3, 0x4ecdc4, 0.8);
        target.setAlpha(0.6);
        target.setDepth(5);
        target.row = row;
        target.col = col;
        target.glow = glow;
        
        const ring = this.add.circle(x, y, this.tileSize / 2.5, 0x4ecdc4, 0);
        ring.setStrokeStyle(2, 0x4ecdc4, 0.5);
        ring.setDepth(5);
        this.tweens.add({
            targets: ring,
            angle: 360,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });
        target.ring = ring;
        
        this.targets.push(target);
    }

    setupKeyboardControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.wasd = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D')
        };
        
        this.input.keyboard.on('keydown-R', () => {
            this.speakText('Restarting level');
            this.loadLevel(this.currentLevel);
        });
        
        this.input.keyboard.on('keydown-H', () => {
            this.showInstructions();
        });
        
        this.input.keyboard.on('keydown-V', () => {
            this.voiceAssistanceEnabled = !this.voiceAssistanceEnabled;
            const status = this.voiceAssistanceEnabled ? 'enabled' : 'disabled';
            this.speakText(`Voice assistance ${status}`);
        });
        
        this.input.keyboard.on('keydown-I', () => {
            this.toggleInstructionPanel();
        });
        
        this.input.keyboard.on('keydown-LEFT', () => this.movePlayer('left'));
        this.input.keyboard.on('keydown-RIGHT', () => this.movePlayer('right'));
        this.input.keyboard.on('keydown-UP', () => this.movePlayer('up'));
        this.input.keyboard.on('keydown-DOWN', () => this.movePlayer('down'));
        
        this.input.keyboard.on('keydown-A', () => this.movePlayer('left'));
        this.input.keyboard.on('keydown-D', () => this.movePlayer('right'));
        this.input.keyboard.on('keydown-W', () => this.movePlayer('up'));
        this.input.keyboard.on('keydown-S', () => this.movePlayer('down'));
    }

    movePlayer(direction) {
        if (!this.player) return;
        
        let newRow = this.player.row;
        let newCol = this.player.col;
        
        switch(direction) {
            case 'left':
                newCol--;
                break;
            case 'right':
                newCol++;
                break;
            case 'up':
                newRow--;
                break;
            case 'down':
                newRow++;
                break;
        }
        
        if (newRow < 0 || newRow >= this.gridSize || newCol < 0 || newCol >= this.gridSize) {
            this.playSound('blocked');
            this.speakText('Cannot move there. Edge of grid.');
            this.cameras.main.shake(100, 0.005);
            return;
        }
        
        const boxAtNewPos = this.boxes.find(box => box.row === newRow && box.col === newCol);
        
        if (boxAtNewPos) {
            if (this.pushBox(boxAtNewPos, direction)) {
                this.executeMove(newRow, newCol);
            } else {
                this.playSound('blocked');
                this.speakText('Cannot push box. Blocked.');
                this.cameras.main.shake(100, 0.005);
            }
        } else {
            this.executeMove(newRow, newCol);
        }
    }

    executeMove(newRow, newCol) {
        this.player.row = newRow;
        this.player.col = newCol;
        
        const newX = newCol * this.tileSize + this.tileSize / 2;
        const newY = newRow * this.tileSize + this.tileSize / 2;
        
        const duration = 150;
        const ease = 'Back.easeOut';
        
        this.tweens.add({
            targets: this.player,
            x: newX,
            y: newY,
            duration: duration,
            ease: ease
        });
        
        if (this.player.glow) {
            this.tweens.add({
                targets: this.player.glow,
                x: newX,
                y: newY,
                duration: duration,
                ease: ease
            });
        }
        
        if (this.player.sparkle) {
            this.tweens.add({
                targets: this.player.sparkle,
                x: newX,
                y: newY,
                duration: duration,
                ease: ease
            });
        }
        
        this.moveCount++;
        this.playSound('move');
        this.speakText(`Moved to row ${newRow + 1}, column ${newCol + 1}`, true);
        
        const trail = this.add.circle(newX, newY, 25, 0xffff00, 0.6);
        trail.setDepth(9);
        this.tweens.add({
            targets: trail,
            scale: 2,
            alpha: 0,
            duration: 400,
            onComplete: () => trail.destroy()
        });
        
        this.updateUI();
    }

    pushBox(box, direction) {
        let newRow = box.row;
        let newCol = box.col;
        
        switch(direction) {
            case 'left':
                newCol--;
                break;
            case 'right':
                newCol++;
                break;
            case 'up':
                newRow--;
                break;
            case 'down':
                newRow++;
                break;
        }
        
        if (newRow < 0 || newRow >= this.gridSize || newCol < 0 || newCol >= this.gridSize) {
            return false;
        }
        
        const blockingBox = this.boxes.find(b => b.row === newRow && b.col === newCol);
        if (blockingBox) {
            return false;
        }
        
        box.row = newRow;
        box.col = newCol;
        
        const newX = newCol * this.tileSize + this.tileSize / 2;
        const newY = newRow * this.tileSize + this.tileSize / 2;
        
        const duration = 150;
        const ease = 'Back.easeOut';
        
        this.tweens.add({
            targets: box,
            x: newX,
            y: newY,
            duration: duration,
            ease: ease
        });
        
        if (box.glow) {
            this.tweens.add({
                targets: box.glow,
                x: newX,
                y: newY,
                duration: duration,
                ease: ease
            });
        }
        
        this.updateBoxStatus(box);
        this.playSound('push');
        this.speakText('Box pushed', true);
        
        return true;
    }

    updateBoxStatus(box) {
        const onTarget = this.targets.some(t => t.row === box.row && t.col === box.col);
        
        if (onTarget && !box.onTarget) {
            box.onTarget = true;
            box.setFillStyle(0x00ff00);
            box.setStrokeStyle(3, 0x00ff00, 1);
            
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const particle = this.add.circle(box.x, box.y, 5, 0x00ff00, 1);
                
                this.tweens.add({
                    targets: particle,
                    x: box.x + Math.cos(angle) * 50,
                    y: box.y + Math.sin(angle) * 50,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => particle.destroy()
                });
            }
            
            const boxesOnTarget = this.getBoxesOnTarget();
            const totalBoxes = this.boxes.length;
            
            this.playSound('success');
            this.speakText(`Excellent! Box on target. ${boxesOnTarget} of ${totalBoxes} ${totalBoxes === 1 ? 'box' : 'boxes'} placed.`);
            
            if (this.checkWinCondition()) {
                this.winLevel();
            }
        } else if (!onTarget && box.onTarget) {
            box.onTarget = false;
            box.setFillStyle(0xff6b35);
            box.setStrokeStyle(3, 0xff4500, 0.8);
            this.speakText('Box moved off target');
        }
        
        this.updateUI();
    }

    getBoxesOnTarget() {
        return this.boxes.filter(box => box.onTarget).length;
    }

    checkWinCondition() {
        return this.boxes.every(box => box.onTarget);
    }

    winLevel() {
        this.playSound('win');
        this.speakText(`Congratulations! Level complete! You won in ${this.moveCount} ${this.moveCount === 1 ? 'move' : 'moves'}. Well done!`);
        
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, 640);
            const y = -20;
            const colors = [0xff6b35, 0x4ecdc4, 0x00ff00, 0xffff00];
            const confetti = this.add.circle(x, y, 8, Phaser.Utils.Array.GetRandom(colors));
            
            this.tweens.add({
                targets: confetti,
                y: 660,
                angle: 720,
                duration: Phaser.Math.Between(1000, 2000),
                ease: 'Cubic.easeIn',
                onComplete: () => confetti.destroy()
            });
        }
        
        this.time.delayedCall(3000, () => {
            this.loadLevel(this.currentLevel + 1);
        });
    }

    setupVoiceControls() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.log('Voice commands not supported in this browser');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;
        
        this.recognition.onstart = () => {
            console.log('✅ Voice recognition STARTED');
            this.isRecognitionActive = true;
        };
        
        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            
            console.log('🎤 Voice command heard:', command);
            this.handleVoiceCommand(command);
        };
        
        this.recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error);
            
            if (event.error === 'no-speech') {
                console.log('No speech detected, restarting...');
                this.time.delayedCall(500, () => this.startVoiceRecognition());
            } else if (event.error === 'aborted') {
                console.log('Recognition aborted, restarting...');
                this.time.delayedCall(500, () => this.startVoiceRecognition());
            }
        };
        
        this.recognition.onend = () => {
            console.log('⚠️ Recognition ended, restarting...');
            this.isRecognitionActive = false;
            this.time.delayedCall(500, () => this.startVoiceRecognition());
        };
        
        this.startVoiceRecognition();
        console.log('🎤 Voice commands initialized');
    }

    startVoiceRecognition() {
        if (!this.recognition) return;
        
        try {
            if (!this.isRecognitionActive) {
                this.recognition.start();
                console.log('🎤 Starting voice recognition...');
            }
        } catch (e) {
            console.log('Recognition already running or error:', e.message);
        }
    }

    handleVoiceCommand(command) {
        console.log('📝 Processing command:', command);
        
        if (command.includes('up') || command.includes('top')) {
            console.log('➡️ Moving UP');
            this.movePlayer('up');
        } 
        else if (command.includes('down') || command.includes('bottom')) {
            console.log('➡️ Moving DOWN');
            this.movePlayer('down');
        } 
        else if (command.includes('left')) {
            console.log('➡️ Moving LEFT');
            this.movePlayer('left');
        } 
        else if (command.includes('right') || command.includes('write') || command.includes('bright')) {
            console.log('➡️ Moving RIGHT');
            this.movePlayer('right');
        }
        else if (command.includes('restart') || command.includes('reset')) {
            console.log('🔄 Restarting level');
            this.loadLevel(this.currentLevel);
        } 
        else if (command.includes('help') || command.includes('instruction')) {
            console.log('ℹ️ Showing help');
            this.showInstructions();
        } 
        else if (command.includes('status') || command.includes('where') || command.includes('position')) {
            console.log('📊 Announcing status');
            this.announceGameState();
        }
        else if (command.includes('toggle voice') || command.includes('voice off') || command.includes('voice on')) {
            this.voiceAssistanceEnabled = !this.voiceAssistanceEnabled;
            const status = this.voiceAssistanceEnabled ? 'enabled' : 'disabled';
            this.speakText(`Voice assistance ${status}`);
        }
        else {
            console.log('❓ Command not recognized:', command);
        }
    }

    speakText(text, quick = false) {
        console.log('🔊 Speaking:', text);
        
        if (this.srElement) {
            this.srElement.textContent = text;
        }
        
        if (!this.voiceAssistanceEnabled) return;
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            
            window.speechSynthesis.speak(utterance);
        }
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch(type) {
            case 'move':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.08);
                break;
            case 'push':
                oscillator.frequency.value = 400;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.12);
                break;
            case 'success':
                oscillator.frequency.value = 1000;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
            case 'win':
                this.playMelody([523, 587, 659, 784, 880]);
                return;
            case 'blocked':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;
            case 'start':
                oscillator.frequency.value = 659;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.25);
                break;
        }
    }

    playMelody(frequencies) {
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + index * 0.15);
            
            oscillator.start(this.audioContext.currentTime + index * 0.15);
            oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.15);
        });
    }

    setupScreenReader() {
        this.srElement = document.getElementById('sr-announcements');
    }

    announceGameState() {
        let state = `Player is at row ${this.player.row + 1}, column ${this.player.col + 1}. `;
        
        state += `There ${this.boxes.length === 1 ? 'is' : 'are'} ${this.boxes.length} ${this.boxes.length === 1 ? 'box' : 'boxes'}. `;
        
        this.boxes.forEach((box, index) => {
            state += `Box ${index + 1} is at row ${box.row + 1}, column ${box.col + 1}`;
            if (box.onTarget) {
                state += ', on target. ';
            } else {
                state += ', not on target. ';
            }
        });
        
        state += `There ${this.targets.length === 1 ? 'is' : 'are'} ${this.targets.length} ${this.targets.length === 1 ? 'target' : 'targets'}. `;
        
        this.targets.forEach((target, index) => {
            state += `Target ${index + 1} is at row ${target.row + 1}, column ${target.col + 1}. `;
        });
        
        const boxesOnTarget = this.getBoxesOnTarget();
        state += `Progress: ${boxesOnTarget} of ${this.boxes.length} ${this.boxes.length === 1 ? 'box' : 'boxes'} on ${this.boxes.length === 1 ? 'target' : 'targets'}. `;
        state += `You have made ${this.moveCount} ${this.moveCount === 1 ? 'move' : 'moves'}.`;
        
        this.speakText(state);
    }

    showInstructions() {
        const instructions = `Welcome to Adaptive Game. 
            This is a puzzle game where you push orange boxes onto blue targets. 
            Controls: Use arrow keys or W, A, S, D keys to move your green character. 
            Press R to restart the current level. 
            Press H to hear these instructions again. 
            Press V to toggle voice assistance on or off. 
            Press I to show or hide the instruction panel.
            Voice commands: Say "move up", "move down", "move left", or "move right" to move. 
            Say "restart" to restart the level. 
            Say "status" to hear your current position and progress. 
            Say "help" to hear these instructions. 
            Every move makes a beep sound. Pushing a box makes a boop sound. 
            Getting a box on target makes a ding sound. 
            Winning a level plays a victory melody.
            The game is fully accessible for blind, deaf, and motor-impaired players. 
            Good luck and have fun!`;
        
        this.speakText(instructions);
    }

    announceVictory() {
        const totalLevels = this.getLevels().length;
        this.speakText(`Amazing! You have completed all ${totalLevels} levels! You are a puzzle master! Press R to play again from level 1.`);
        
        this.time.delayedCall(5000, () => {
            this.loadLevel(0);
        });
    }

    createUI() {
        const panelBg = this.add.rectangle(320, 30, 600, 50, 0x0f3460, 0.7);
        panelBg.setStrokeStyle(2, 0x4ecdc4, 0.5);
        
        const titleGlow = this.add.text(320, 30, 'ADAPTIVE GAME', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#4ecdc4',
            fontStyle: 'bold',
            stroke: '#4ecdc4',
            strokeThickness: 3
        });
        titleGlow.setOrigin(0.5);
        titleGlow.setAlpha(0.3);
        
        const title = this.add.text(320, 30, 'ADAPTIVE GAME', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        
        this.tweens.add({
            targets: [title, titleGlow],
            scale: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        const statsBg = this.add.rectangle(100, 90, 180, 100, 0x0f3460, 0.7);
        statsBg.setStrokeStyle(2, 0x4ecdc4, 0.5);
        
        this.levelText = this.add.text(20, 70, '', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#4ecdc4',
            fontStyle: 'bold'
        });
        
        this.moveText = this.add.text(20, 95, '', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff6b35',
            fontStyle: 'bold'
        });
        
        this.progressText = this.add.text(20, 120, '', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        
        const instructionBg = this.add.rectangle(320, 625, 620, 30, 0x0f3460, 0.8);
        instructionBg.setStrokeStyle(2, 0x4ecdc4, 0.3);
        
        const instructions = this.add.text(320, 625, '⬅️ ➡️ ⬆️ ⬇️ WASD Move  •  R Restart  •  H Help  •  V Voice  •  I Instructions', {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        });
        instructions.setOrigin(0.5);
        
        const accessBadge = this.add.text(600, 625, '♿', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#4ecdc4'
        });
        accessBadge.setOrigin(0.5);
        
        this.tweens.add({
            targets: accessBadge,
            scale: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.updateUI();
    }

    updateUI() {
        if (this.levelText) {
            this.levelText.setText(`📊 Level: ${this.currentLevel + 1}/${this.getLevels().length}`);
        }
        if (this.moveText) {
            this.moveText.setText(`👣 Moves: ${this.moveCount}`);
        }
        if (this.progressText) {
            this.progressText.setText(`📦 Boxes: ${this.getBoxesOnTarget()}/${this.boxes.length}`);
        }
    }
}