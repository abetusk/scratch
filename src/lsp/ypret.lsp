; https://8dcc.github.io/programming/understanding-y-combinator.html
;(d Y
;   (f (foo)
;      ((f (x) (foo (f (n) ((x x) n))))
;       (f (x) (foo (f (n) ((x x) n)))))))

(d Y (f (foo) ((f (x) (foo (f (n) ((x x) n)))) (f (x) (foo (f (n) ((x x) n)))))))

;(d fg
;   (f (self)
;      (f (n)
;         (if (= n 0)
;           1
;           (* n (self (- n 1)))))))

(d fg (f (self) (f (u) (if (= u 0) 1 (* u (self (- u 1)))))))

(d factorio (Y fg))
(factorio 5)
