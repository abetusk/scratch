(def gcd
  (func (a b)
    (cond
      ((< a b) (gcd b a))
      ((= b 0) a)
      ((= b 1) 1)
      (1 (gcd (% a b) b))
    )
  )
)
