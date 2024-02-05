#ifndef TRLE_H
#define TRLE_H

#include <stdio.h>
#include <stdlib.h>

#include <string.h>
#include <stdint.h>
#include <getopt.h>

#include <vector>
#include <string>

#include "emin_rbt.h"

//
// s - start of interval
// e - end of interval, non inclusive
//
typedef struct value_interval_range_type {
  int32_t val;
  int64_t s, e;
} value_range_t;

static int _key_cmp(const void *a, const void *b) {
  value_range_t *_a, *_b;
  _a = (value_range_t *)a;
  _b = (value_range_t *)b;

  if (_a->s < _b->s) { return -1; }
  if (_a->s > _b->s) { return  1; }
 
  return 0;
}

static void _key_destroy(void *a) { free(a); }
static void _info_destroy(void *a) { }

static void _key_print(const void *a) {
  value_range_t *key;
  key = (value_range_t *)a;
  printf("[%i:%i){v:%i}\n", (int)key->s, (int)key->e, (int)key->val);
}
static void _info_print(void *a) { }

class TRLE {
  public:

    TRLE() {
      m_tree = RBTreeCreate(_key_cmp, _key_destroy, _info_destroy, _key_print, _info_print);

      m_length = 0;
      m_start = 0;
      m_node_count = 0;
    }
    ~TRLE() {
      if (m_tree) {
        RBTreeDestroy(m_tree);
      }
    }

    void print() {
      printf("m_tree: %p (root:%p) (nil:%p)\n", m_tree, m_tree->root, m_tree->nil);
      RBTreePrint(m_tree);
    }

    int init(int64_t s, int64_t e_ninc, int32_t val) {
      value_range_t *vr;

      RBTreeDestroy(m_tree);
      m_tree = RBTreeCreate(_key_cmp, _key_destroy, _info_destroy, _key_print, _info_print);

      vr = (value_range_t *)malloc(sizeof(value_range_t));
      vr->val = val;
      vr->s = s;
      vr->e = e_ninc;

      RBTreeInsert(m_tree, vr, NULL);
      m_node_count=1;

      m_length = e_ninc - s;
      m_start = s;

      return 0;
    }

    int consistency_r(rb_red_blk_node *node, int lvl=0) {
      int r;
      value_range_t *vr, *vr_l, *vr_r;
      rb_red_blk_node *node_l,
                      *node_r;

      if ((!node) || (node == m_tree->nil)) { return 0; }

      vr = (value_range_t *)(node->key);
      if (!vr) { return -1; }

      // check predecessor node has endpoint matching start point
      // and different values
      //
      node_l = TreePredecessor(m_tree, node);
      if ((node_l) && (node_l != m_tree->nil)) {
        vr_l = (value_range_t *)(node_l->key);
        if (!vr_l) { return -2; }
        if (vr_l->val == vr->val) { return -4; }
        if (vr_l->e != vr->s) { return -6; }
      }

      // check successor node has endpoint matching start point
      // and different values
      //
      node_r = TreeSuccessor(m_tree, node);
      if ((node_r) && (node_r != m_tree->nil)) {
        vr_r = (value_range_t *)(node_r->key);
        if (!vr_r) { return -3; }
        if (vr_r->val == vr->val) { return -5; }
        if (vr_r->s != vr->e) { return -7; }
      }

      // recur left and right
      //
      node_l = node->left;
      if ((node_l) && (node_l != m_tree->nil)) {
        r = consistency_r(node_l,lvl+1);
        if (r<0) { return r; }
      }

      node_r = node->right;
      if ((node_r) && (node_r != m_tree->nil)) {
        r = consistency_r(node_r,lvl+1);
        if (r<0) { return r; }
      }

      return 0;
    }

    void print_tree_r( rb_red_blk_node *node, int lvl=0 ) {
      int i;
      if ((!node) || (node == m_tree->nil)) { return; }

      for (i=0; i<lvl; i++) { printf(" "); }
      printf("node:%p, key:%p\n", node, node->key);

      print_tree_r(node->left, lvl+1);
      print_tree_r(node->right, lvl+1);
    }

    int consistency() {
      //print_tree_r( m_tree->root->left );
      return consistency_r( m_tree->root->left );
    }

    int read(int32_t *val, int64_t index) {
      value_range_t *vr, query;
      rb_red_blk_node *node;

      query.val = -1;
      query.s = index;
      query.e = index+1;

      node = m_tree->root->left;
      while ((node) && (node != m_tree->nil)) {
        vr = (value_range_t *)(node->key);
        if ((vr->s <= index) &&
            (vr->e > index)) {
          if (val) { *val = vr->val; }
          return 0;
        }

        if      (vr->e <= index) { node = node->right; continue; }
        else if (vr->s >  index) { node = node->left;  continue; }
        return -1;
      }

      return -1;
    }

    int update(int64_t index, int32_t val) {
      int64_t orig_s,
              orig_e,
              orig_val,
              merge_s,
              merge_e;
      value_range_t *vr, *orig_vr,
                    *vr_new,
                    *vr_l, *vr_r,
                    query;
      rb_red_blk_node *node,
                      *node_l,
                      *node_r,
                      *node_new,
                      *node_orig ;

      query.val = val;
      query.s = index;
      query.e = index+1;

      node = m_tree->root->left;
      while ((node) && (node != m_tree->nil)) {

        vr = (value_range_t *)(node->key);
        if (vr->e > index) {
          if (vr->s <= index) { break; }
          node = node->left;
          continue;
        }

        if (vr->s <= index) {
          if (vr->e > index) { break; }
          node = node->right;
          continue;
        }

        return -1;
      }

      if ((!node) || (node == m_tree->nil)) { return -1; }

      node_orig = node;
      orig_vr = (value_range_t *)(node_orig->key);
      if (vr->val == val) { return 1; }

      orig_s = orig_vr->s;
      orig_e = orig_vr->e;
      orig_val = orig_vr->val;

      vr_new = (value_range_t *)malloc(sizeof(value_range_t));
      vr_new->val = val;
      vr_new->s = index;
      vr_new->e = index+1;

      vr_l = NULL;
      if (orig_s < index) {
        vr_l = (value_range_t *)malloc(sizeof(value_range_t));
        vr_l->val = orig_val;
        vr_l->s = orig_s;
        vr_l->e = index;
      }

      vr_r = NULL;
      if (orig_e > (index+1)) {
        vr_r = (value_range_t *)malloc(sizeof(value_range_t));
        vr_r->val = orig_val;
        vr_r->s = index+1;
        vr_r->e = orig_e;
      }

      RBDelete(m_tree, node_orig);
      m_node_count--;

      if (vr_l) { RBTreeInsert(m_tree, vr_l, NULL); m_node_count++; }
      if (vr_r) { RBTreeInsert(m_tree, vr_r, NULL); m_node_count++; }
      node = RBTreeInsert(m_tree, vr_new, NULL);
      m_node_count++;

      vr_new = (value_range_t *)(node->key);

      merge_s = index;
      merge_e = index+1;

      node_l = TreePredecessor(m_tree, node);
      if ((node_l) && (node_l != m_tree->nil)) {
        vr_l = (value_range_t *)(node_l->key);
        if (vr_l->val == val) {
          vr_new->s = vr_l->s;
          RBDelete(m_tree, node_l);
          m_node_count--;
        }
      }

      node_r = TreeSuccessor(m_tree, node);
      if ((node_r) && (node_r != m_tree->nil)) {
        vr_r = (value_range_t *)(node_r->key);
        if (vr_r->val == val) {
          vr_new->e = vr_r->e;
          RBDelete(m_tree, node_r);
          m_node_count--;
        }
      }

      return 0;
    }

    //---

    rb_red_blk_tree *m_tree;
    int64_t m_length;
    int64_t m_start;
    int64_t m_node_count;
};

#endif
