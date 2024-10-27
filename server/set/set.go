package set

type Set[T comparable] map[T]bool

func New[T comparable](elems ...T) Set[T] {
	set := make(Set[T], len(elems))
	for _, elem := range elems {
		set[elem] = true
	}
	return set
}

func (s Set[T]) Add(elems ...T) Set[T] {
	for _, elem := range elems {
		s[elem] = true
	}
	return s
}

func (s Set[T]) Remove(elems ...T) Set[T] {
	for _, elem := range elems {
		delete(s, elem)
	}
	return s
}

func (s Set[T]) Contains(elem T) bool {
	return s[elem]
}
