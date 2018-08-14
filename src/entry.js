const Vector = require('./vector.js');
document.write('It works I promise you');
var data;
var context;
var width;
var height;
var scene = {};

window.onload = function() {
  var c = document.getElementById('c');
  width = 640 * .5;
  height = 480 * .5;

  c.width = width;
  c.height = height;
  c.style.cssText = 'width:' + (width * 2) + 'px;height:' + (height * 2 ) + 'px';
  context = c.getContext('2d');
  data = context.getImageData(0, 0, width, height);
  scene.camera = {
    point: {x: 0, y: 1.8, z: 10},
    fieldOfView: 45,
    vector: {x: 0, y: 3, z: 0}
  };
  scene.lights = [{x: -30, y: -10, z: 20}];
  scene.objects = [
    {
      type: 'sphere',
      point: {x: 0, y: 3.5, z: -3},
      color: {x: 155, y: 200, z: 155},
      specular: 0.2,
      lambert: 0.7,
      ambient: 0.1,
      radius: 3
    },
    {
      type: 'sphere',
      point: {x: -4, y: 2, z: -1},
      color: {x: 155, y: 155, z: 155},
      specular: 0.1,
      lambert: 0.9,
      ambient: 0.0,
      radius: 0.2
    },
    {
      type: 'sphere',
      point: {x: -4, y: 3, z: -1},
      color: {x: 255, y: 255, z: 255},
      specular: 0.2,
      lambert: 0.7,
      ambient: 0.1,
      radius: 0.1
    }
  ];
  render(scene);
  document.getElementById('play').onclick = play;
  document.getElementById('stop').onclick = stop;
}

function render(scene) {
  var camera = scene.camera;
  var objects = scene.objects;
  var lights = scene.lights;
  var eyeVector = Vector.unitVector(Vector.subtract(camera.vector, camera.point));
  var vpRight = Vector.unitVector(Vector.crossProduct(eyeVector, Vector.UP));
  var vpUp = Vector.unitVector(Vector.crossProduct(vpRight, eyeVector));
  var fovRadians = Math.PI * (camera.fieldOfView / 2) / 180;
  var heightWidthRatio = height / width;
  var halfWidth = Math.tan(fovRadians);
  var halfHeight = heightWidthRatio * halfWidth;
  var cameraWidth = halfWidth * 2;
  var cameraHeight = halfHeight * 2;
  var pixelWidth = cameraWidth / (width - 1);
  var pixelHeight = cameraHeight / (height - 1);

  var index;
  var color;
  var ray = { point: camera.point};
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var xcomp = Vector.scale(vpRight, (x * pixelWidth) - halfWidth);
      var ycomp = Vector.scale(vpUp, (y * pixelHeight) - halfHeight);
      ray.vector = Vector.unitVector(Vector.add3(eyeVector, xcomp, ycomp));
      color = trace(ray, scene, 0);
      index = (x * 4) + (y * width * 4);
      data.data[index + 0] = color.x;
      data.data[index + 1] = color.y;
      data.data[index + 2] = color.z;
      data.data[index + 3] = 255;
    }
  }
  context.putImageData(data, 0, 0);
}

function trace(ray, scene, depth) {
  if (depth > 3) return;

  var distObject = intersectScene(ray, scene);

  if (distObject[0] === Infinity) {
    return Vector.WHITE;
  }

  var dist = distObject[0];
  var object = distObject[1];

  var pointAtTime = Vector.add(ray.point, Vector.scale(ray.vector, dist));

  return surface(ray, scene, object, pointAtTime, sphereNormal(object, pointAtTime), depth);
}

function intersectScene(ray, scene) {
  var closest = [Infinity, null];

  for (var i = 0; i < scene.objects.length; i++) {
    var object = scene.objects[i];
    var dist = sphereIntersection(object, ray);

    if (dist !== undefined && dist < closest[0]) {
      closest = [dist, object];
    }
  }
  return closest;
}

function sphereIntersection(sphere, ray) {
  var eyeToCenter = Vector.subtract(sphere.point, ray.point);
  var v = Vector.dotProduct(eyeToCenter, ray.vector);
  var eoDot = Vector.dotProduct(eyeToCenter, eyeToCenter);
  var discriminant = (sphere.radius * sphere.radius) - eoDot + (v * v);

  if (discriminant < 0) {
    return;
  } else {
    return v - Math.sqrt(discriminant);
  }
}

function sphereNormal(sphere, pos) {
  return Vector.unitVector(Vector.subtract(pos, sphere.point));
}

function surface(ray, scene, object, pointAtTime, normal, depth) {
  var b = object.color;
  var c = Vector.ZERO;
  var lambertAmount = 0;

  if (object.lambert) {
    for (var i = 0; i < scene.lights.length; i++) {
      var lightPoint = scene.lights[0];

      if (!isLightVisible(pointAtTime, scene, lightPoint)) {
        continue;
      }
      var contribution = Vector.dotProduct(Vector.unitVector(Vector.subtract(lightPoint, pointAtTime)), normal);
      if (contribution > 0) lambertAmount += contribution;
    }
  }

  if (object.specular) {
    var reflectedRay = {
      point: pointAtTime,
      vector: Vector.reflectThrough(ray.vector, normal)
    };
    var reflectedColor = trace(reflectedRay, scene, ++depth);
    if (reflectedColor) {
      c = Vector.add(c, Vector.scale(reflectedColor, object.specular));
    }
    lambertAmount = Math.min(1, lambertAmount);
    return Vector.add3(c,
          Vector.scale(b, lambertAmount * object.lambert),
          Vector.scale(b, object.ambient));
  }
}

function isLightVisible(pt, scene, light) {
  var distObject = intersectScene({
    point: pt,
    vector: Vector.unitVector(Vector.subtract(pt, light))
  }, scene);
  return distObject[0] > -0.005;
}

var planet1 = 0;
var planet2 = 0;

function tick() {
  planet1 += 0.1;
  planet2 += 0.2;

  scene.objects[1].point.x = Math.sin(planet1) * 3.5;
  scene.objects[1].point.z = -3 + (Math.cos(planet1) * 3.5);
  scene.objects[2].point.x = Math.sin(planet2) * 4;
  scene.objects[2].point.z = -3 + (Math.cos(planet2) * 4);

  render(scene);
  if (playing) {
    setTimeout(tick, 10);
  }
}

var playing = false;

function play() {
  playing = true;
  tick();
}

function stop() {
  playing = false;
}

