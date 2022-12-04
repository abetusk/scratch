// 
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//  
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//  
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

#include "mcut/mcut.h"

#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <unistd.h>
#include <string.h>

#include <errno.h>



//#include <map>
#include <vector>

#include <Eigen/Core>
#include <igl/read_triangle_mesh.h>
#include <igl/writeOBJ.h>

void exit_err(McResult err) {
  fprintf(stderr, "error: %i, exiting\n", (int)err);
  exit(-1);
}

struct InputMesh {
  std::vector<std::vector<double>> V;
  std::vector<std::vector<int>> F;

  std::string fpath;
  std::vector<uint32_t> faceSizesArray;
  std::vector<uint32_t> faceIndicesArray;
  std::vector<double> vertexCoordsArray;
};

int loadMeshOFF(InputMesh &mesh, const char *fn) {
  bool meshLoaded = false;

  mesh.fpath = fn;
  meshLoaded = igl::read_triangle_mesh(mesh.fpath, mesh.V, mesh.F);

  if (!meshLoaded) { return -1; }

  for (int i = 0; i < (int)mesh.V.size(); ++i) {
    const std::vector<double>& v = mesh.V[i];
    if (v.size()!=3) { return -2; }
    mesh.vertexCoordsArray.push_back(v[0]);
    mesh.vertexCoordsArray.push_back(v[1]);
    mesh.vertexCoordsArray.push_back(v[2]);
  }

  for (int i = 0; i < (int)mesh.F.size(); ++i) {
    const std::vector<int>& f = mesh.F[i];
    for (int j = 0; j < (int)f.size(); ++j) {
      mesh.faceIndicesArray.push_back(f[j]);
    }
    mesh.faceSizesArray.push_back((uint32_t)f.size());
  }

  return 0;
}

void show_help(FILE *fp) {
  fprintf(fp, "\nusage:\n\n    climcut [-h] [-v] [-s subject] [-c clip] [-t op] [-o output]\n");
  fprintf(fp, "\n");
  fprintf(fp, "  [-s subj]  subject file\n");
  fprintf(fp, "  [-c clip]  clip file\n");
  fprintf(fp, "  [-t op]    operation (0 - a-b, 1 - b-a, 2 - union, 3 - intersection)\n");
  fprintf(fp, "  [-v]       version\n");
  fprintf(fp, "  [-h]       help (this screen)\n");
  fprintf(fp, "\n");
}

int main(int argc, char **argv) {
  FILE *ofp=stdout;
  int _r = 0, ch=0;

  InputMesh srcMesh, cutMesh;
  bool meshLoaded = false;

  uint32_t n_component;

  std::string subj_fn, clip_fn, out_fn = "-";
  int op_idx = 2;
  int patch_idx=0;

  McFlags flags = MC_DISPATCH_FILTER_ALL;
  McFlags flag_opts[4];

  // a - b
  //
  flag_opts[0] = MC_DISPATCH_FILTER_FRAGMENT_SEALING_INSIDE | MC_DISPATCH_FILTER_FRAGMENT_LOCATION_ABOVE;

  // b - a
  //
  flag_opts[1] = MC_DISPATCH_FILTER_FRAGMENT_SEALING_OUTSIDE | MC_DISPATCH_FILTER_FRAGMENT_LOCATION_BELOW;

  // union
  //
  flag_opts[2] = MC_DISPATCH_FILTER_FRAGMENT_SEALING_OUTSIDE | MC_DISPATCH_FILTER_FRAGMENT_LOCATION_ABOVE;

  // intersection
  //
  flag_opts[3] = MC_DISPATCH_FILTER_FRAGMENT_SEALING_INSIDE | MC_DISPATCH_FILTER_FRAGMENT_LOCATION_BELOW;

  flags = flag_opts[2];

  McContext ctx= MC_NULL_HANDLE;

  //------

  while ((ch = getopt(argc, argv, "hvs:c:t:o:")) != -1) {
    switch(ch) {
      case 'h':
        show_help(stdout);
        exit(0);
      case 'v':
        show_help(stdout);
        exit(0);
      case 's':
        subj_fn = optarg;
        break;
      case 'c':
        clip_fn = optarg;
        break;
      case 't':
        op_idx = atoi(optarg);
        break;
      case 'o':
        out_fn = optarg;
        break;
      default:
        fprintf(stderr, "bad argument\n");
        show_help(stderr);
        exit(1);
    }
  }

  if ((op_idx < 0)  || (op_idx >= 4)) {
    fprintf(stderr, "operation (-t) must be one in list\n");
    show_help(stderr);
    exit(-1);
  }

  if (subj_fn.size() == 0) {
    fprintf(stderr, "provide subject file\n");
    show_help(stderr);
    exit(-1);
  }

  if (clip_fn.size() == 0) {
    fprintf(stderr, "provide clip file\n");
    show_help(stderr);
    exit(-1);
  }

  flags = flag_opts[op_idx];

  //------

  //McResult err = mcCreateContext(&ctx, MC_DEBUG);
  McResult err = mcCreateContext(&ctx, 0);
  if (err != MC_NO_ERROR) { exit(-1); }

  err = mcDebugMessageControl(ctx, MC_DEBUG_SOURCE_ALL, MC_DEBUG_TYPE_ALL, MC_DEBUG_SEVERITY_ALL, false);

  //_r = loadMeshOFF(srcMesh, "data/bunny.off");
  _r = loadMeshOFF(srcMesh, subj_fn.c_str());
  if (_r < 0) { fprintf(stderr, "error loading bunny.off"); exit(-1); }
  //_r = loadMeshOFF(cutMesh, "data/armadillo.off");
  _r = loadMeshOFF(cutMesh, clip_fn.c_str());
  if (_r < 0) { fprintf(stderr, "error loading armadillo.off"); exit(-1); }

  //printf("starting...\n"); fflush(stdout);

  err = mcDispatch( ctx,
                    MC_DISPATCH_VERTEX_ARRAY_DOUBLE |
                      MC_DISPATCH_ENFORCE_GENERAL_POSITION |
                      flags,
                    (const void *)(srcMesh.vertexCoordsArray.data()),
                    (const uint32_t *)(srcMesh.faceIndicesArray.data()),
                    srcMesh.faceSizesArray.data(),
                    (uint32_t)(srcMesh.vertexCoordsArray.size() / 3),
                    (uint32_t)(srcMesh.faceSizesArray.size()),

                    (const void *)(cutMesh.vertexCoordsArray.data()),
                    cutMesh.faceIndicesArray.data(),
                    cutMesh.faceSizesArray.data(),
                    (uint32_t)(cutMesh.vertexCoordsArray.size() / 3),
                    (uint32_t)(cutMesh.faceSizesArray.size()));
  if (err != MC_NO_ERROR) { exit(-2); }

  //printf("ok\n"); fflush(stdout);

  err = mcGetConnectedComponents(ctx, MC_CONNECTED_COMPONENT_TYPE_FRAGMENT, 0, NULL, &n_component);
  if (err != MC_NO_ERROR) { exit(-2); }

  //printf("connected components: %d\n", (int)n_component);

  if (n_component == 0) {
    fprintf(stdout, "no connected components found\n");
    exit(0);
  }

  std::vector<McConnectedComponent> connectedComponents(n_component, MC_NULL_HANDLE);
  connectedComponents.resize(n_component);
  err = mcGetConnectedComponents( ctx,
                                  MC_CONNECTED_COMPONENT_TYPE_FRAGMENT,
                                  (uint32_t)connectedComponents.size(),
                                  connectedComponents.data(),
                                  NULL);
  if (err != MC_NO_ERROR) { exit_err(err); }

  for (patch_idx = 0; patch_idx < n_component; patch_idx++) {

    // query the data of each connected component from MCUT
    // -------------------------------------------------------

    McConnectedComponent connComp = connectedComponents[patch_idx];

    // query the vertices
    // ----------------------

    uint64_t numBytes = 0;
    err = mcGetConnectedComponentData(ctx, connComp, MC_CONNECTED_COMPONENT_DATA_VERTEX_DOUBLE, 0, NULL, &numBytes);
    if (err != MC_NO_ERROR) { exit_err(err); }

    uint32_t ccVertexCount = (uint32_t)(numBytes / (sizeof(double) * 3));
    std::vector<double> ccVertices((uint64_t)ccVertexCount * 3u, 0);
    err = mcGetConnectedComponentData(ctx, connComp, MC_CONNECTED_COMPONENT_DATA_VERTEX_DOUBLE, numBytes, (void*)ccVertices.data(), NULL);
    if (err != MC_NO_ERROR) { exit_err(err); }

    // query the faces
    // -------------------
    numBytes = 0;

    err = mcGetConnectedComponentData(ctx, connComp, MC_CONNECTED_COMPONENT_DATA_FACE_TRIANGULATION, 0, NULL, &numBytes);
    if (err != MC_NO_ERROR) { exit_err(err); }

    std::vector<uint32_t> ccFaceIndices(numBytes / sizeof(uint32_t), 0);
    err = mcGetConnectedComponentData(ctx, connComp, MC_CONNECTED_COMPONENT_DATA_FACE_TRIANGULATION, numBytes, ccFaceIndices.data(), NULL);
    if (err != MC_NO_ERROR) { exit_err(err); }

    std::vector<uint32_t> faceSizes(ccFaceIndices.size() / 3, 3);
    const uint32_t ccFaceCount = static_cast<uint32_t>(faceSizes.size());

    /// ------------------------------------------------------------------------------------

    // Here we show, how to know when connected components, pertain particular boolean operations.


    McPatchLocation patchLocation = (McPatchLocation)0;

    err = mcGetConnectedComponentData(ctx, connComp, MC_CONNECTED_COMPONENT_DATA_PATCH_LOCATION, sizeof(McPatchLocation), &patchLocation, NULL);
    if (err != MC_NO_ERROR) { exit_err(err); }

    McFragmentLocation fragmentLocation = (McFragmentLocation)0;
    err = mcGetConnectedComponentData(  ctx,
                                        connComp,
                                        MC_CONNECTED_COMPONENT_DATA_FRAGMENT_LOCATION,
                                        sizeof(McFragmentLocation), &fragmentLocation,
                                        NULL);
    if (err != MC_NO_ERROR) { exit_err(err); }

    if (out_fn == "-") { ofp = stdout; }
    else {

      std::string numstr = std::to_string(patch_idx);
      std::string foo = numstr;
      foo += out_fn;

      //ofp = fopen( out_fn.c_str(), "w" );
      ofp = fopen( foo.c_str(), "w" );


    }

    // write vertices and normals
    for (uint32_t i = 0; i < ccVertexCount; ++i) {
        double x = ccVertices[(uint64_t)i * 3 + 0];
        double y = ccVertices[(uint64_t)i * 3 + 1];
        double z = ccVertices[(uint64_t)i * 3 + 2];
        //file << "v " << std::setprecision(std::numeric_limits<long double>::digits10 + 1) << x << " " << y << " " << z << std::endl;
        fprintf(ofp, "v %f %f %f\n", x, y, z);
    }

    int faceVertexOffsetBase = 0;

    // for each face in CC
    for (uint32_t f = 0; f < ccFaceCount; ++f) {
      bool reverseWindingOrder = (fragmentLocation == MC_FRAGMENT_LOCATION_BELOW) && (patchLocation == MC_PATCH_LOCATION_OUTSIDE);
      int faceSize = faceSizes.at(f);
      //file << "f ";
      fprintf(ofp, "f ");
      // for each vertex in face
      for (int v = (reverseWindingOrder ? (faceSize - 1) : 0);
        (reverseWindingOrder ? (v >= 0) : (v < faceSize));
        v += (reverseWindingOrder ? -1 : 1)) {
        const int ccVertexIdx = ccFaceIndices[(uint64_t)faceVertexOffsetBase + v];
        //file << (ccVertexIdx + 1) << " ";
        fprintf(ofp, "%i ", (int)(ccVertexIdx+1));
      } // for (int v = 0; v < faceSize; ++v) {
      //file << std::endl;
      fprintf(ofp, "\n");

      faceVertexOffsetBase += faceSize;
    }

    if (ofp != stdout) { fclose(ofp); }

  }


  // 6. free connected component data
  // --------------------------------
  err = mcReleaseConnectedComponents(ctx, (uint32_t)connectedComponents.size(), connectedComponents.data());
  if (err != MC_NO_ERROR) { exit_err(err); }


  err = mcReleaseContext(ctx);
  if (err != MC_NO_ERROR) { exit_err(err); }

  //printf("end\n");
}
