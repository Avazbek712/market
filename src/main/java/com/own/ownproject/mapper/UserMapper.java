package com.own.ownproject.mapper;

import com.own.ownproject.entity.Permission;
import com.own.ownproject.entity.User;
import com.own.ownproject.payload.UserMeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {


    @Mapping(source = "role.name", target = "role")
    @Mapping(source = "role.permissions", target = "permissions")
    UserMeDTO userToUserMeDTO(User user);

    default List<String> mapPermissions(Set<Permission> permissions) {
        return permissions
                .stream()
                .map(Permission::getCode).toList();
    }
}
