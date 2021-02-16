Lean Notes
===

[Natural Number Game](http://wwwf.imperial.ac.uk/~buzzard/xena/natural_number_game/)

---

[src](http://wwwf.imperial.ac.uk/~buzzard/xena/natural_number_game/?world=3&level=9)

```
lemma mul_left_comm (a b c : mynat) : a * (b * c) = b * (a * c) :=
begin
  rw mul_comm,
  rw mul_assoc,
  rw mul_comm c,
  refl,
end
```

---

[src](http://wwwf.imperial.ac.uk/~buzzard/xena/natural_number_game/?world=5&level=3)

```
example (P Q R S T U: Type)
(p : P)
(h : P → Q)
(i : Q → R)
(j : Q → T)
(k : S → T)
(l : T → U)
: U :=

begin
  have q := h(p),
  have t := j(q),
  have u := l(t),
  exact u,
end
```

---

[src](http://wwwf.imperial.ac.uk/~buzzard/xena/natural_number_game/?world=5&level=9)

```
example (A B C D E F G H I J K L : Type)
(f1 : A → B) (f2 : B → E) (f3 : E → D) (f4 : D → A) (f5 : E → F)
(f6 : F → C) (f7 : B → C) (f8 : F → G) (f9 : G → J) (f10 : I → J)
(f11 : J → I) (f12 : I → H) (f13 : E → H) (f14 : H → K) (f15 : I → L)
 : A → L :=
 
begin
  intro a,
  have x0 := f1(a),
  have x1 := f2(x0),
  have x2 := f5(x1),
  have x3 := f8(x2),
  have x4 := f9(x3),
  have x5 := f11(x4),
  exact f15(x5),
end
```

---

 have q := h(p),
  have t := j(q),
  have u := l(t),
  exact u,
f :
begin
14
15
16
17
18
19
20
intro h,
intro i,
cases h with h0 h1,
cases i with i0 i1,
split,
exact h0,
exact i1,
No Results
end


###### 2020-06-24
