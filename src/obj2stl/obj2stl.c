/*
The MIT License (MIT)

Copyright (c) 2012-Present, Syoyo Fujita and many contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

#include <stdio.h>
#include <stdlib.h>

#include <stdint.h>
#include <string.h>

#include <vector>
#include <string>

#define TINYOBJLOADER_IMPLEMENTATION
#include "./tiny_obj_loader.h"

int _load2tri(std::vector< double > &tri, std::string &inputfile) {
  //std::string inputfile = "c000.obj";
  tinyobj::ObjReaderConfig reader_config;
  reader_config.mtl_search_path = "./"; // Path to material files

  tinyobj::ObjReader reader;

  //std::vector< std::vector< double > > tri;
  std::vector< double > _vtx;

  if (!reader.ParseFromFile(inputfile, reader_config)) {
    if (!reader.Error().empty()) {
      //printf("error..\n");
    }
    return -1;
  }

  if (!reader.Warning().empty()) {
    //printf("error...\n");
    return -2;
  }

  auto& attrib = reader.GetAttrib();
  auto& shapes = reader.GetShapes();
  auto& materials = reader.GetMaterials();

  // Loop over shapes
  for (size_t s = 0; s < shapes.size(); s++) {
    // Loop over faces(polygon)

    //printf("##shape:%i\n", (int)s);

    size_t index_offset = 0;
    for (size_t f = 0; f < shapes[s].mesh.num_face_vertices.size(); f++) {
      size_t fv = size_t(shapes[s].mesh.num_face_vertices[f]);

      //printf("##face:%i\n", (int)f);

      // Loop over vertices in the face.
      for (size_t v = 0; v < fv; v++) {
        // access to vertex
        tinyobj::index_t idx = shapes[s].mesh.indices[index_offset + v];
        tinyobj::real_t vx = attrib.vertices[3*size_t(idx.vertex_index)+0];
        tinyobj::real_t vy = attrib.vertices[3*size_t(idx.vertex_index)+1];
        tinyobj::real_t vz = attrib.vertices[3*size_t(idx.vertex_index)+2];

        tri.push_back(vx);
        tri.push_back(vy);
        tri.push_back(vz);

        // Check if `normal_index` is zero or positive. negative = no normal data
        if (idx.normal_index >= 0) {
          tinyobj::real_t nx = attrib.normals[3*size_t(idx.normal_index)+0];
          tinyobj::real_t ny = attrib.normals[3*size_t(idx.normal_index)+1];
          tinyobj::real_t nz = attrib.normals[3*size_t(idx.normal_index)+2];
        }

        // Check if `texcoord_index` is zero or positive. negative = no texcoord data
        if (idx.texcoord_index >= 0) {
          tinyobj::real_t tx = attrib.texcoords[2*size_t(idx.texcoord_index)+0];
          tinyobj::real_t ty = attrib.texcoords[2*size_t(idx.texcoord_index)+1];
        }

        // Optional: vertex colors
        // tinyobj::real_t red   = attrib.colors[3*size_t(idx.vertex_index)+0];
        // tinyobj::real_t green = attrib.colors[3*size_t(idx.vertex_index)+1];
        // tinyobj::real_t blue  = attrib.colors[3*size_t(idx.vertex_index)+2];

        /*
        printf("%f %f %f\n", (double)vx, (double)vy, (double)vz);
        if (v == (fv-1)) {
          tinyobj::index_t _idx = shapes[s].mesh.indices[index_offset + 0];
          tinyobj::real_t _vx = attrib.vertices[3*size_t(_idx.vertex_index)+0];
          tinyobj::real_t _vy = attrib.vertices[3*size_t(_idx.vertex_index)+1];
          tinyobj::real_t _vz = attrib.vertices[3*size_t(_idx.vertex_index)+2];
          printf("%f %f %f\n", (double)_vx, (double)_vy, (double)_vz);
        }
        */

      }
      //printf("\n\n");
      index_offset += fv;

      // per-face material
      shapes[s].mesh.material_ids[f];
    }
  }

  return 0;
}

void tri2stl(std::vector< double > &tri, const std::string &name = std::string("tri2stl") );

//void tri2stl(std::vector< double > &tri, const std::string &name = std::string("tri2stl") ) {
void tri2stl(std::vector< double > &tri, const std::string &name) {
  int idx;
  double x, y, z,
         nx,ny,nz,
         v[3], u[3], w[3],
         wlen;
  //std::string name = "tri2stl";
  double _eps = (1.0/(1024.0*1024.0));

  printf("solid %s\n", name.c_str());

  for (idx=0; idx<tri.size(); idx+=9) {


    u[0] = tri[idx+3] - tri[idx+0];
    u[1] = tri[idx+4] - tri[idx+1];
    u[2] = tri[idx+5] - tri[idx+2];

    v[0] = tri[idx+6] - tri[idx+0];
    v[1] = tri[idx+7] - tri[idx+1];
    v[2] = tri[idx+8] - tri[idx+2];


    w[0] = (u[1]*v[2] - u[2]*v[1]);
    w[1] = (u[2]*v[0] - u[0]*v[2]);
    w[2] = (u[0]*v[1] - u[1]*v[0]);

    wlen = sqrt( w[0]*w[0] + w[1]*w[1] + w[2]*w[2] );
    nx = ny = nz = 0.0;
    if (wlen > _eps) {
      nx = w[0] / wlen;
      ny = w[1] / wlen;
      nz = w[2] / wlen;
    }

    printf("facet normal %f %f %f\n", nx, ny, nz);
    printf("  outer loop\n");
    printf("    vertex %f %f %f\n", tri[idx+0], tri[idx+1], tri[idx+2]);
    printf("    vertex %f %f %f\n", tri[idx+3], tri[idx+4], tri[idx+5]);
    printf("    vertex %f %f %f\n", tri[idx+6], tri[idx+7], tri[idx+8]);
    printf("  endloop\n");
    printf("endfacet\n");
  }

  printf("endsolid %s\n", name.c_str());

  return;
}

int main(int argc, char **argv) {
  std::vector< double > tri;
  std::string fn;

  if (argc != 2) {
    fprintf(stderr, "usage:\n\n  obj2stl objfile\n\n");
    exit(-1);
  }

  fn = argv[1];

  _load2tri(tri, fn);

  tri2stl(tri);
}
