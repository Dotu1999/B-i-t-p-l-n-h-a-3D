// HelloTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'uniform mat4 u_modelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position =u_ViewMatrix*u_modelMatrix*a_Position;\n' +
  '  v_Position = vec3(u_modelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  // '  gl_FragColor = v_Color;\n' +
     // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' +
     // Calculate the light direction and make its length 1.
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
     // The dot product of the light direction and the orientation of a surface (the normal)
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
  '}\n';
//thay đổi điểm nhìn
x=1.0;
y=1.0;
z=3.0;
document.getElementById('change_view').addEventListener('click',function(){
  var hi = new Audio("notification.mp3");
  hi.play();
  x = document.getElementById('page_x').value;
  y = document.getElementById('page_y').value;
  z = document.getElementById('page_z').value;
  i=1;
  document.getElementById("rotate").checked = false;
  if(typeof id != "undefined")
  {cancelAnimationFrame(id);}
  main();
})
// thay đổi vị trí nguồn sáng
var light_position_x = 2.3;
var light_position_y =4.0;
var light_position_z =3.5;
document.getElementById('change_light_position').addEventListener('click',function(){
  var hi = new Audio("notification.mp3");
  hi.play();
  light_position_x =Number(document.getElementById('light_position_x').value);
  light_position_y =Number(document.getElementById('light_position_y').value);
  light_position_z =Number(document.getElementById('light_position_z').value);
  i=1;
  document.getElementById("rotate").checked = false;
  if(typeof id != "undefined")
  {cancelAnimationFrame(id);}
  main();
})
function main() {
  // Retrieve <canvas> element
   canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
   gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //
  // var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  // var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  // Set the light color (white)
  gl.uniform3f(u_LightColor, light_color_r, light_color_g, light_color_b);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, light_position_x, light_position_y, light_position_z);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, ambient_r, ambient_g, ambient_b);
  // Phép chiếu phối cảnh
  viewMatrix = new Matrix4();
  viewMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);//góc-tỉ lệ mặt cắt gần-near-far
  viewMatrix.lookAt(x, y, z, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  // Set the light color (white)
  var u_ViewMatrix = gl.getUniformLocation(gl.program ,'u_ViewMatrix');
  gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements);
  //Các phép biến đổi tạo hoạt cảnh 
  var modelMatrix = new Matrix4();
  var u_modelMatrix = gl.getUniformLocation(gl.program ,'u_modelMatrix');
  // modelMatrix.translate(0.35,0.0,0.0);
  gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix.elements);
  // currentAngle =0.0;
  var normalMatrix = new Matrix4();
  tick = function() {
    currentAngle =(currentAngle + 0.5)%360;
    draw(gl, currentAngle, modelMatrix, u_modelMatrix);
   //  var normalMatrix = new Matrix4(); // Transformation matrix for normals
  	normalMatrix.setInverseOf(modelMatrix);
  	normalMatrix.transpose();
  	gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    id=requestAnimationFrame(tick);
   }
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  draw(gl, currentAngle, modelMatrix, u_modelMatrix);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
var currentAngle = 0.0;
function draw(gl, currentAngle, modelMatrix, u_ModelMatrix)
{
modelMatrix.setTranslate(-T_x,-T_y,-T_z);
modelMatrix.rotate(currentAngle,x2+T_x,y2+T_y,z2+T_z);
modelMatrix.translate(T_x,T_y,T_z);
// modelMatrix.scale(0.5,0.5,0.5);
//truyền ma trận đến vertex shader
gl.uniformMatrix4fv (u_ModelMatrix, false, modelMatrix.elements);
//xóa <canvas> và sau đó gọi gl.drawArrays() 
// gl.clear(gl.COLOR_BUFFER_BIT);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);

}
function initVertexBuffers(gl) {
  //vị trí các đỉnh
  var vertices = new Float32Array([
     0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
     0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
     0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
    -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
     0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
  ]);
  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);
  // Colors
 //  var colors = new Float32Array([
 //    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,   0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
 //    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
 //    0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,     // v0-v5-v6-v1 up
 //    1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1,     // v1-v6-v7-v2 left
 //    1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v7-v4-v3-v2 down
 //    0, 1, 1,   0, 1, 1,   0, 1, 1,  0, 1, 1　    // v4-v7-v6-v5 back
 // ]);
 var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);
  // Create a buffer object
  //tạo bộ đệm cho vị trí và màu sắc các đỉnh
  initArrayBuffer(gl, 'a_Position', vertices, 3);
  initArrayBuffer(gl, 'a_Color', colors, 3);
  initArrayBuffer(gl, 'a_Normal', normals, 3);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  //tạo bộ đệm cho chỉ số các đỉnh
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}
//hàm tạo bộ đệm cho thuộc tính
function initArrayBuffer(gl, attribute, data, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}
//chọn xoay hay ko xoay hình lập phương
var i=0;
document.getElementById('rotate').addEventListener('click',function(){
  var hi = new Audio("pristine-609.mp3");
  hi.play();
  if(i==0 && typeof id != "undefined")
  {
    cancelAnimationFrame(id);
    i=1;
  }
  else{
    tick();
    i=0;
  }
})
//hàm đổi từ hex sang rgb
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
//Đổi màu cho hình lập phương
document.getElementById('change_colors').addEventListener('click',function(){
  var hi = new Audio("notification.mp3");
  hi.play();
  var gt = document.getElementById('color').value;
  gt_color =document.getElementById('favcolor').value;
  for(let i =0 ; i < colors.length;i=i+3)
  {
      if(gt == 'front' && i <=9)
      {
        colors[i]=hexToRgb(gt_color).r/255;
        colors[i+1]=hexToRgb(gt_color).g/255;
        colors[i+2]=hexToRgb(gt_color).b/255;
      }
      if(gt == 'back' && (i>=60 && i<=69))
      {
        colors[i]=hexToRgb(gt_color).r/255;
        colors[i+1]=hexToRgb(gt_color).g/255;
        colors[i+2]=hexToRgb(gt_color).b/255;
      }
      if(gt == 'up' && (i>=24 && i<=33))
      {
        colors[i]=hexToRgb(gt_color).r/255;
        colors[i+1]=hexToRgb(gt_color).g/255;
        colors[i+2]=hexToRgb(gt_color).b/255;
      }
      if(gt == 'dow'&& (i>=48 && i<=57))
      {
        colors[i]=hexToRgb(gt_color).r/255;
        colors[i+1]=hexToRgb(gt_color).g/255;
        colors[i+2]=hexToRgb(gt_color).b/255;
      }
      if(gt == 'right' && (i>=12 && i<=21) )
      {
        colors[i]=hexToRgb(gt_color).r/255;
        colors[i+1]=hexToRgb(gt_color).g/255;
        colors[i+2]=hexToRgb(gt_color).b/255;
      }
      if(gt == 'left' && (i>=36 && i<=45))
      {
        colors[i]=hexToRgb(gt_color).r/255;
        colors[i+1]=hexToRgb(gt_color).g/255;
        colors[i+2]=hexToRgb(gt_color).b/255;
      }
  }
  if(gt == 'lightColor')
  {
  	light_color_r=hexToRgb(gt_color).r/255;
    light_color_g=hexToRgb(gt_color).g/255;
    light_color_b=hexToRgb(gt_color).b/255;
  }
  if(gt == 'ambientLight')
  {
  	ambient_r=hexToRgb(gt_color).r/255;
    ambient_g=hexToRgb(gt_color).g/255;
    ambient_b=hexToRgb(gt_color).b/255;
  }
  i=1;
  document.getElementById("rotate").checked = false;
  if(typeof id != "undefined")
  {cancelAnimationFrame(id);}
  main();
})
var light_color_r =1.0;
var light_color_g =1.0;
var light_color_b =1.0;
var ambient_r = 0.2;
var ambient_g = 0.2;
var ambient_b = 0.2;
var colors = new Float32Array([
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,   0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,     // v0-v5-v6-v1 up
    1, 0, 1,   1, 0, 1,   1, 0, 1,  1, 0, 1,     // v1-v6-v7-v2 left
    1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v7-v4-v3-v2 down
    0, 1, 1,   0, 1, 1,   0, 1, 1,  0, 1, 1　    // v4-v7-v6-v5 back
 ]);
//thay đổi trục quay :
document.getElementById('change_rotate').addEventListener('click',function(){
var hi = new Audio("notification.mp3");
hi.play();
x1 =Number(document.getElementById('page_x1').value);
y1 =Number(document.getElementById('page_y1').value);
z1 =Number(document.getElementById('page_z1').value);
x2 =Number(document.getElementById('page_x2').value);
y2 =Number(document.getElementById('page_y2').value);
z2 =Number(document.getElementById('page_z2').value);
T_x= x1*(-1);
T_y= y1*(-1);
T_z= z1*(-1);
})
x1=0.0;y1=0.0;z1=0.0;
x2=1.0;y2=1.0;z2 =1.0;
// T_x=0;T_y=0;T_z=0
T_x = x1*(-1);
T_y = y1*(-1);
T_z = z1*(-1);