package pictoclash

import "github.com/twitchtv/twirp"

func ErrUnimplimented() error {
	return twirp.NewError(twirp.Unimplemented, "not implemented")
}

func ErrInternal(msg string, err error) error {
	// TODO: only include error if in local or dev environment
	tErr := twirp.InternalError(msg)
	if err != nil {
		return tErr.WithMeta("cause", err.Error())
	}
	return tErr
}

func ErrRequiredArgument(arg string) error {
	return twirp.RequiredArgumentError(arg)
}

func ErrInvalidArgument(arg, msg string) error {
	return twirp.InvalidArgumentError(arg, msg)
}

func ErrNotFound(msg string) error {
	return twirp.NotFoundError(msg)
}
