// list of tasks to complete
const tasksNormal = {
    1 : {type:'mat', startMat: [1,0,0,1], endMat: [1,0,0,1], startVec: {'x':1,'y':1}, endVec: {'x':5,'y':5}, 
        description: 'Can you scale the vector to match? ',
        endCard: 'Congratualations! Well done on completing the first task'},
    2 : {type:'vec', startMat: [2,0,0,2], endMat: [-1,0,0,-1], startVec: {'x':5,'y':5}, endVec: {'x':5,'y':5},
        description: 'Here you have both a scale and a reflection',
        endCard: ''},
    3 : {type:'mat', startMat: [3,0,0,1], endMat: [1,0,0,1], startVec: {'x':-5,'y':1}, endVec: {'x':-5,'y':5}, 
        description: 'Can you figure out the matrix to map this vector ',
        endCard: ''},
    4 : {type:'vec', startMat: [4,1,1,4], endMat: [1,0,0,1], startVec: {'x':1,'y':-5}, endVec: {'x':5,'y':-5}, 
        description: 'Can you figure out the matrix to map this vector ',
        endCard: ''},
}

// inverse tasks to be implemented
const inverseTasks = {
    1 : {type:'inverse', startMat: [5,0,0,5], endMat: [1,0,0,1], 
        description: 'Can you inverse this matrix? ',
        endCard: 'Congratualations! Well done on completing the first task'},
    2 : {type:'inverse', startMat: [-4,0,0,4], endMat: [1,0,0,1], 
        description: '',
        endCard: ''},
    3 : {type:'inverse', startMat: [1,1,1,1], endMat: [1,0,0,1],
        description: 'Can you figure out the matrix to map this vector ',
        endCard: ''},
}

export {tasksNormal, inverseTasks}