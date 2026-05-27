(def gcd
   (func (a b)
      (if (< a b) (gcd b a)
        (if (= b 0) a
          (if (= b 1) 1
            (gcd (% a b) b)
          )
        )
      )
   )
)
(gcd 25 15)
(gcd 15 25)
(gcd 7 99)
(gcd 99 7)
