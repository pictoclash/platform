package pictoclash

import "github.com/google/uuid"

func mustNullableUUID(id string) uuid.NullUUID {
	if id == "" {
		return uuid.NullUUID{}
	}
	return uuid.NullUUID{
		Valid: true,
		UUID:  uuid.MustParse(id),
	}
}

func mustUUID(id string) uuid.UUID {
	return uuid.MustParse(id)
}

func convertUUIDs(ids []string) ([]uuid.UUID, error) {
	strIDs := make([]uuid.UUID, 0, len(ids))
	for _, id := range ids {
		uid, err := uuid.Parse(id)
		if err != nil {
			return nil, err
		}
		strIDs = append(strIDs, uid)
	}
	return strIDs, nil
}
