const undoBtn = document.querySelector('#button-undo');
const restartBtn = document.querySelector('#button-restart');
const updateBtn = document.querySelector('#button-update');

const branchLenRng = document.querySelector('#branch-length');
const branchLenLbl = document.querySelector('#branch-length-lbl');
const branchWidRng = document.querySelector('#branch-width');
const branchWidLbl = document.querySelector('#branch-width-lbl');
const branchRatioRng = document.querySelector('#branch-ratio');
const branchRatioLbl = document.querySelector('#branch-ratio-lbl');
const branchColor = document.querySelector('#branch-color');

const leafLenRng = document.querySelector('#leaf-length');
const leafLenLbl = document.querySelector('#leaf-length-lbl');
const leafWidRng = document.querySelector('#leaf-width');
const leafWidLbl = document.querySelector('#leaf-width-lbl');
const leafDepRng = document.querySelector('#leaf-depth');
const leafDepLbl = document.querySelector('#leaf-depth-lbl');
const leafColor = document.querySelector('#leaf-color');

const yawRng = document.querySelector('#yaw');
const yawLbl = document.querySelector('#yaw-lbl');
const pitchRng = document.querySelector('#pitch');
const pitchLbl = document.querySelector('#pitch-lbl');
const rollRng = document.querySelector('#roll');
const rollLbl = document.querySelector('#roll-lbl');

const ruleXInpt = document.querySelector('#rule-X');
const ruleFInpt = document.querySelector('#rule-F');
const ruleLInpt = document.querySelector('#rule-L');

const rulePopup = document.querySelector('#rule-popup');
const rulePopupLbl = document.querySelector('#rule-popup-lbl');

export class GUI {
    constructor(lsys) {
        this.lsys = lsys;

        this.init.bind(this);
        this.connect.bind(this);

        this.next.bind(this);
        this.prev.bind(this);
        this.reset.bind(this);
        this.updateBranchLength.bind(this);
        this.updateBranchWidth.bind(this);
        this.updateBranchRatio.bind(this);
        this.updateBranchColor.bind(this);
        this.updateLeafLength.bind(this);
        this.updateLeafWidth.bind(this);
        this.updateLeafDepth.bind(this);
        this.updateLeafColor.bind(this);
        this.updateYaw.bind(this);
        this.updatePitch.bind(this);
        this.updateRoll.bind(this);
        this.updateRuleX.bind(this);
        this.updateRuleF.bind(this);
        this.updateRuleL.bind(this);
    }

    init() {
        // default settings
        const branchLen = parseFloat(branchLenRng.value);
        const branchWid = parseFloat(branchWidRng.value);
        const branchRat = parseFloat(branchRatioRng.value);
        const branchCol = branchColor.value;
        const leafLen = parseFloat(leafLenRng.value);
        const leafWid = parseFloat(leafWidRng.value);
        const leafDep = parseFloat(leafDepRng.value);
        const leafCol = leafColor.value;
        const yaw = parseFloat(yawRng.value);
        const pitch = parseFloat(pitchRng.value);
        const roll = parseFloat(rollRng.value);

        this.lsys.map['F'].wid = branchWid;
        this.lsys.map['F'].len = branchLen;
        this.lsys.map['F'].ratio = branchRat;
        this.lsys.map['F'].color = branchCol;
        this.lsys.map['L'].wid = leafWid;
        this.lsys.map['L'].len = leafLen;
        this.lsys.map['L'].dep = leafDep;
        this.lsys.map['L'].color = leafCol;
        this.lsys.yaw = yaw;
        this.lsys.pitch = pitch;
        this.lsys.roll = roll;
    }

    next() {
        this.lsys.next();
        this.lsys.build();
    }

    prev() {
        this.lsys.prev();
        this.lsys.build();
    }

    reset() {
        this.lsys.reset();
        this.lsys.build();
    }

    updateBranchLength() {
        // recall: branchWid represents a fraction [0,1] from branchLen
        const val = branchLenRng.value;
        const label = branchLenLbl.innerText.split(':')[0];
        branchLenLbl.innerText = `${label}: ${val}`;
        // update both branch len and width
        const fraction = parseFloat(branchWidRng.value);
        this.lsys.map['F'].len = parseFloat(val);
        this.lsys.map['F'].wid = parseFloat(val) * fraction;
        this.lsys.update();
    }

    updateBranchWidth() {
        // recall: branchWid represents a fraction [0,1] from branchLen
        const fraction = parseFloat(branchWidRng.value);
        const val = parseFloat(branchLenRng.value) * fraction;
        const label = branchWidLbl.innerText.split(':')[0];
        branchWidLbl.innerText = `${label}: ${fraction}`;
        this.lsys.map['F'].wid = parseFloat(val);
        this.lsys.update();
    }

    updateBranchRatio() {
        const val = branchRatioRng.value;
        const label = branchRatioLbl.innerText.split(':')[0];
        branchRatioLbl.innerText = `${label}: ${val}`;
        this.lsys.map['F'].ratio = parseFloat(val);
        this.lsys.update();
    }

    updateBranchColor() {
        const val = branchColor.value;
        this.lsys.map['F'].color = val;
        this.lsys.update();
    }

    updateLeafLength() {
        // recall: branchWid represents a fraction [0,1] from branchLen
        const val = leafLenRng.value;
        leafLenLbl.innerText = `${leafLenLbl.innerText.split(':')[0]}: ${val}`;
        this.lsys.map['L'].len = parseFloat(val);
        this.lsys.update();
    }

    updateLeafWidth() {
        // recall: branchWid represents a fraction [0,1] from branchLen
        const val = leafWidRng.value;
        leafWidLbl.innerText = `${leafWidLbl.innerText.split(':')[0]}: ${val}`;
        this.lsys.map['L'].wid = parseFloat(val);
        this.lsys.update();
    }

    updateLeafDepth() {
        // recall: branchWid represents a fraction [0,1] from branchLen
        const val = leafDepRng.value;
        leafDepLbl.innerText = `${leafDepLbl.innerText.split(':')[0]}: ${val}`;
        this.lsys.map['L'].dep = parseFloat(val);
        this.lsys.update();
    }

    updateLeafColor() {
        const val = leafColor.value;
        this.lsys.map['L'].color = val;
        this.lsys.update();
    }

    updateYaw() {
        const val = yawRng.value;
        yawLbl.innerText = `${yawLbl.innerText.split(':')[0]}: ${val}`;
        this.lsys.yaw = parseFloat(val);
        this.lsys.update();
    }

    updatePitch() {
        const val = pitchRng.value;
        pitchLbl.innerText = `${pitchLbl.innerText.split(':')[0]}: ${val}`;
        this.lsys.pitch = parseFloat(val);
        this.lsys.update();
    }

    updateRoll() {
        const val = rollRng.value;
        rollLbl.innerText = `${rollLbl.innerText.split(':')[0]}: ${val}`;
        this.lsys.roll = parseFloat(val);
        this.lsys.update();
    }

    updateRuleX() {
        const val = ruleXInpt.value;
        this.lsys.rules = { X: val };

        this.lsys.prev();
        this.lsys.next();
        this.lsys.build();
    }

    updateRuleF() {
        const val = ruleFInpt.value;
        this.lsys.rules = { F: val };

        this.lsys.prev();
        this.lsys.next();
        this.lsys.build();
    }

    updateRuleL() {
        const val = ruleLInpt.value;
        this.lsys.rules = { L: val };

        this.lsys.prev();
        this.lsys.next();
        this.lsys.build();
    }

    connect() {
        updateBtn.addEventListener('click', this.next);
        restartBtn.addEventListener('click', this.reset);
        undoBtn.addEventListener('click', this.prev);

        branchLenRng.addEventListener('input', this.updateBranchLength);
        branchWidRng.addEventListener('input', this.updateBranchWidth);
        branchRatioRng.addEventListener('input', this.updateBranchRatio);
        branchColor.addEventListener('change', this.updateBranchColor);

        leafLenRng.addEventListener('input', this.updateLeafLength);
        leafWidRng.addEventListener('input', this.updateLeafWidth);
        leafDepRng.addEventListener('input', this.updateLeafDepth);
        leafColor.addEventListener('change', this.updateLeafColor);

        yawRng.addEventListener('input', this.updateYaw);
        pitchRng.addEventListener('input', this.updatePitch);
        rollRng.addEventListener('input', this.updateRoll);

        ruleXInpt.addEventListener('change', this.updateRuleX);
        ruleFInpt.addEventListener('change', this.updateRuleF);
        ruleLInpt.addEventListener('change', this.updateRuleL);

        rulePopupLbl.addEventListener('click', function () {
            rulePopup.classList.toggle('show');
        });

        window.addEventListener('load', this.init);
    }
}
