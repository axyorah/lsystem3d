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
    lsys.undoState();
    lsys.draw();
})

restartBtn.addEventListener('click', function (evt) {
    lsys.reset();
    lsys.draw();
})

updateBtn.addEventListener('click', function (evt) {
    lsys.incrementState();
    lsys.draw();    
})

branchLenRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const val = this.value;
    branchLenLbl.innerText = `${branchLenLbl.innerText.split(':')[0]}: ${val}`;
    // update both branch len and width
    const fraction = parseFloat(branchWidRng.value);
    lsys.setBranchLen( parseFloat(val) );
    lsys.setBranchWid( parseFloat(val) * fraction);
    lsys.updateConfig();
})

branchWidRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const fraction = this.value;
    const val = branchLenRng.value * fraction;
    branchWidLbl.innerText = `${branchWidLbl.innerText.split(':')[0]}: ${fraction}`;
    lsys.setBranchWid( parseFloat(val) );
    lsys.updateConfig();
})

branchRatioRng.addEventListener('input', function (evt) {
    const val  = this.value;
    branchRatioLbl.innerText = `${branchRatioLbl.innerText.split(':')[0]}: ${val}`;
    lsys.setBranchRatio( parseFloat(val) );
    lsys.updateConfig();
})

branchColor.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.setBranchColor( val );    
})

leafLenRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const val = this.value;
    leafLenLbl.innerText = `${leafLenLbl.innerText.split(':')[0]}: ${val}`;
    lsys.setLeafLen( parseFloat(val) );
    lsys.updateConfig();
})

leafWidRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const val = this.value;
    leafWidLbl.innerText = `${leafWidLbl.innerText.split(':')[0]}: ${val}`;
    lsys.setLeafWid( parseFloat(val) );
    lsys.updateConfig();
})

leafDepRng.addEventListener('input', function (evt) {
    // recall: branchWid represents a fraction [0,1] from branchLen
    const val = this.value;
    leafDepLbl.innerText = `${leafDepLbl.innerText.split(':')[0]}: ${val}`;
    lsys.setLeafDep( parseFloat(val) );
    lsys.updateConfig();
})

leafColor.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.setLeafColor( val );    
})

yawRng.addEventListener('input', function (evt) {
    const val = this.value;
    yawLbl.innerText = `${yawLbl.innerText.split(':')[0]}: ${val}`;
    lsys.setAngleYaw( parseFloat(val) );
    lsys.updateConfig();
})

pitchRng.addEventListener('input', function (evt) {
    const val = this.value;
    pitchLbl.innerText = `${pitchLbl.innerText.split(':')[0]}: ${val}`;
    lsys.setAnglePitch( parseFloat(val) );
    lsys.updateConfig();
})

rollRng.addEventListener('input', function (evt) {
    const val = this.value;
    rollLbl.innerText = `${rollLbl.innerText.split(':')[0]}: ${val}`;
    lsys.setAngleRoll( parseFloat(val) );
    lsys.updateConfig();
})

ruleXInpt.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.setRules( 'X', val);

    const steps = lsys._states.length - 1;
    lsys.reset();
    lsys.incrementState( steps );
    lsys.draw();
})

ruleFInpt.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.setRules( 'F', val );

    const steps = lsys._states.length - 1;
    lsys.reset();
    lsys.incrementState( steps );
    lsys.draw();
})

ruleLInpt.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.setRules( 'L', val );

    const steps = lsys._states.length - 1;
    lsys.reset();
    lsys.incrementState( steps );
    lsys.draw();
})

rulePopupLbl.addEventListener('click', function (evt) {
    rulePopup.classList.toggle('show');
    console.log('popup clicked!');
})
