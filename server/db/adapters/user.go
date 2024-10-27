package adapters

import (
	"fmt"
	"pictoclash/db/queries"
	"pictoclash/twirp/pb"
)

type userToPB pb.User

func UserToPB() *userToPB {
	return &userToPB{}
}

func (u *userToPB) WithUser(qu queries.User) *userToPB {
	u.Id = qu.ID.String()
	u.Username = qu.Username
	u.Bio = qu.Bio.String
	if qu.CustomPronouns.Valid {
		u.Pronouns = qu.CustomPronouns.String
	}
	return u
}

func (u *userToPB) WithPronouns(qp queries.Pronoun) *userToPB {
	if u.Pronouns != "" || qp.SubjectPronoun == "" || qp.ObjectPronoun == "" {
		return u
	}
	u.Pronouns = fmt.Sprintf("%s/%s", qp.SubjectPronoun, qp.ObjectPronoun)
	return u
}

func (u *userToPB) PB() *pb.User {
	return (*pb.User)(u)
}
