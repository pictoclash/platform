package pictoclash

import (
	"context"
	"log/slog"
	"pictoclash/db/adapters"
	"pictoclash/twirp/pb"
)

func (s *Service) TestUser(ctx context.Context, req *pb.TestUserReq) (*pb.TestUserRes, error) {
	qUser, err := s.q.GetTestUser(ctx)
	if err != nil {
		slog.ErrorContext(ctx, "failed to get test user", "err", err)
		return nil, ErrInternal("failed to get test user", err)
	}

	user := adapters.UserToPB().WithUser(qUser.User).WithPronouns(qUser.Pronoun).PB()
	return &pb.TestUserRes{
		User: user,
	}, nil
}
