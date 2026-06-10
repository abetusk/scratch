; https://8dcc.github.io/programming/understanding-y-combinator.html
;(d Y
;   (f (g)
;      ((f (x) (g (f (n) ((x x) n))))
;       (f (x) (g (f (n) ((x x) n)))))))

(d Y (f (g) ((f (x) (g (f (n) ((x x) n)))) (f (x) (g (f (n) ((x x) n)))))))

;(d fg
;   (f (self)
;      (f (n)
;         (if (= n 0)
;           1
;           (* n (self (- n 1)))))))

(d fg (f (self) (f (w) (if (= w 0) 1 (* w (self (- w 1)))))))

(d factorio (Y fg))
(factorio 5)
