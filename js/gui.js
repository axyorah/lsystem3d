const undoBtn = document.querySelector('#button-undo');
const restartBtn = document.querySelector('#button-restart');
const updateBtn = document.querySelector('#button-update');

const branchLenRng = document.querySelector('#branch-length');
const branchLenLbl = document.querySelector('#branch-length-lbl');
const branchWidRng = document.querySelector('#branch-width');
const branchWidLbl = document.querySelector('#branch-width-lbl');
const branchColor = document.querySelector('#branch-color');
const branchColorLbl = document.querySelector('#branch-color-lbl');

const yawRng = document.querySelector('#yaw');
const yawLbl = document.querySelector('#yaw-lbl');
const pitchRng = document.querySelector('#pitch');
const pitchLbl = document.querySelector('#pitch-lbl');
const rollRng = document.querySelector('#roll');
const rollLbl = document.querySelector('#roll-lbl');

const ruleXInpt = document.querySelector('#rule-X');
const ruleFInpt = document.querySelector('#rule-F');


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
    //lsys.draw();
})

branchColor.addEventListener('change', function (evt) {
    const val = this.value;
    lsys.setBranchColor( val );    
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
