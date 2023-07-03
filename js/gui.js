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
const branchColorLbl = document.querySelector('#branch-color-lbl');

const leafLenRng = document.querySelector('#leaf-length');
const leafLenLbl = document.querySelector('#leaf-length-lbl');
const leafWidRng = document.querySelector('#leaf-width');
const leafWidLbl = document.querySelector('#leaf-width-lbl');
const leafDepRng = document.querySelector('#leaf-depth');
const leafDepLbl = document.querySelector('#leaf-depth-lbl');
const leafColor = document.querySelector('#leaf-color');
const leafColorLbl = document.querySelector('#leaf-color-lbl');

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

undoBtn.addEventListener('click', function (evt) {
    lsys.prev();
    lsys.build();
});

restartBtn.addEventListener('click', function (evt) {
    lsys.reset();
    lsys.build();
});

updateBtn.addEventListener('click', function (evt) {
    lsys.next();
    lsys.build();
});

branchLenRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const val = this.value;
    branchLenLbl.innerText = `${branchLenLbl.innerText.split(':')[0]}: ${val}`;
    // update both branch len and width
    const fraction = parseFloat(branchWidRng.value);
    lsys.map['F'].len = parseFloat(val);
    lsys.map['F'].wid = parseFloat(val) * fraction;
    lsys.update();
});

branchWidRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const fraction = parseFloat(this.value);
    const val = parseFloat(branchLenRng.value) * fraction;
    branchWidLbl.innerText = `${
        branchWidLbl.innerText.split(':')[0]
    }: ${fraction}`;
    lsys.map['F'].wid = parseFloat(val);
    lsys.update();
});

branchRatioRng.addEventListener('input', function (evt) {
    const val = this.value;
    branchRatioLbl.innerText = `${
        branchRatioLbl.innerText.split(':')[0]
    }: ${val}`;
    lsys.map['F'].ratio = parseFloat(val);
    lsys.update();
});

branchColor.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.map['F'].color = val;
    lsys.update();
});

leafLenRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const val = this.value;
    leafLenLbl.innerText = `${leafLenLbl.innerText.split(':')[0]}: ${val}`;
    lsys.map['L'].len = parseFloat(val);
    lsys.update();
});

leafWidRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const val = this.value;
    leafWidLbl.innerText = `${leafWidLbl.innerText.split(':')[0]}: ${val}`;
    lsys.map['L'].wid = parseFloat(val);
    lsys.update();
});

leafDepRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const val = this.value;
    leafDepLbl.innerText = `${leafDepLbl.innerText.split(':')[0]}: ${val}`;
    lsys.map['L'].dep = parseFloat(val);
    lsys.update();
});

leafColor.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.map['L'].color = val;
    lsys.update();
});

yawRng.addEventListener('input', function (evt) {
    const val = this.value;
    yawLbl.innerText = `${yawLbl.innerText.split(':')[0]}: ${val}`;
    lsys.yaw = parseFloat(val);
    lsys.update();
});

pitchRng.addEventListener('input', function (evt) {
    const val = this.value;
    pitchLbl.innerText = `${pitchLbl.innerText.split(':')[0]}: ${val}`;
    lsys.pitch = parseFloat(val);
    lsys.update();
});

rollRng.addEventListener('input', function (evt) {
    const val = this.value;
    rollLbl.innerText = `${rollLbl.innerText.split(':')[0]}: ${val}`;
    lsys.roll = parseFloat(val);
    lsys.update();
});

ruleXInpt.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.rules = { X: val };

    lsys.prev();
    lsys.next();
    lsys.build();
});

ruleFInpt.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.rules = { F: val };

    lsys.prev();
    lsys.next();
    lsys.build();
});

ruleLInpt.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.rules = { L: val };

    lsys.prev();
    lsys.next();
    lsys.build();
});

rulePopupLbl.addEventListener('click', function (evt) {
    rulePopup.classList.toggle('show');
});

window.addEventListener('load', (evt) => {
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

    lsys.map['F'].wid = branchWid;
    lsys.map['F'].len = branchLen;
    lsys.map['F'].ratio = branchRat;
    lsys.map['F'].color = branchCol;
    lsys.map['L'].wid = leafWid;
    lsys.map['L'].len = leafLen;
    lsys.map['L'].dep = leafDep;
    lsys.map['L'].color = leafCol;
    lsys.yaw = yaw;
    lsys.pitch = pitch;
    lsys.roll = roll;
});
